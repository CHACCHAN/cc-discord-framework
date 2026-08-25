/**
 * テスト用の足場。
 *
 * **ネットワークにも API キーにも触りません** — モデルは `ai/test` の
 * {@link MockLanguageModelV3} を使い、Discord は「`reply()` が実際に触る
 * ぶんだけ」を備えた偽のインタラクションで代用します。
 *
 * `finishReason` と `usage` は AI SDK v7 の入れ子の形
 * (`{ unified, raw }` / `{ inputTokens: { total, ... } }`)でなければ
 * 捨てられてしまうので、ここで正しい形に組み立てています。
 */
import { APICallError, type LanguageModel } from "ai";
import { MockLanguageModelV3 } from "ai/test";
import { Client } from "cc-discord-framework";
import { ai, type AiOptions } from "../src/index.js";

/** ai プラグイン入りのオフラインクライアント。 */
export function createAiClient(options: AiOptions = {}, logger?: unknown) {
	return new Client({
		intents: [],
		baseDirectory: null,
		logger: (logger ?? { level: "silent" }) as never,
		plugins: [ai(options)],
	});
}

/** 記録した内容を覗ける偽ロガー(既定動作がログへ落ちたことを確かめるため)。 */
export function fakeLogger() {
	const errors: unknown[][] = [];
	const warnings: unknown[][] = [];
	const logger = {
		errors,
		warnings,
		level: "error",
		child: () => logger,
		error: (...args: unknown[]) => errors.push(args),
		warn: (...args: unknown[]) => warnings.push(args),
		info: () => undefined,
		debug: () => undefined,
		trace: () => undefined,
		fatal: () => undefined,
		silent: () => undefined,
	};
	return logger;
}

/** v7 の入れ子のトークン数。 */
export function usage(input: number, output: number) {
	return {
		inputTokens: { total: input, noCache: input, cacheRead: 0, cacheWrite: 0 },
		outputTokens: { total: output, text: output, reasoning: 0 },
	};
}

/** v7 の終了理由。 */
export function finish(reason: "stop" | "tool-calls") {
	return { unified: reason, raw: undefined } as const;
}

/** 決まった文章をまとめて返すモデル。 */
export function mockModel(text: string): LanguageModel {
	return new MockLanguageModelV3({
		doGenerate: async () => ({
			content: [{ type: "text", text }],
			finishReason: finish("stop"),
			usage: usage(3, 5),
			warnings: [],
		}),
	});
}

/** 断片を順に流すモデル。`gap` を渡すと断片のあいだで待ちます。 */
export function mockStreamModel(chunks: readonly string[], gap = 0): LanguageModel {
	return new MockLanguageModelV3({
		doStream: async () => ({
			stream: new ReadableStream({
				async start(controller) {
					controller.enqueue({ type: "stream-start", warnings: [] });
					controller.enqueue({ type: "text-start", id: "1" });
					for (const chunk of chunks) {
						if (gap > 0) await Bun.sleep(gap);
						controller.enqueue({ type: "text-delta", id: "1", delta: chunk });
					}
					controller.enqueue({ type: "text-end", id: "1" });
					controller.enqueue({
						type: "finish",
						finishReason: finish("stop"),
						usage: usage(1, chunks.length),
					});
					controller.close();
				},
			}),
		}),
	});
}

/**
 * 渡された呼び出しオプションを記録するモデル。
 * `instructions` などが本当にモデルへ届いたかを確かめるのに使います。
 */
export function mockRecordingModel(text: string) {
	const model = new MockLanguageModelV3({
		doGenerate: async () => ({
			content: [{ type: "text", text }],
			finishReason: finish("stop"),
			usage: usage(1, 1),
			warnings: [],
		}),
	});
	return { model: model as LanguageModel, calls: model.doGenerateCalls };
}

/** 引用元(Web 検索など)を添えて返すモデル。 */
export function mockSourceModel(text: string, sources: readonly { url: string; title?: string }[]) {
	return new MockLanguageModelV3({
		doGenerate: async () => ({
			content: [
				...sources.map((source, index) => ({
					type: "source" as const,
					sourceType: "url" as const,
					id: `s${index + 1}`,
					url: source.url,
					...(source.title === undefined ? {} : { title: source.title }),
				})),
				{ type: "text" as const, text },
			],
			finishReason: finish("stop"),
			usage: usage(1, 1),
			warnings: [],
		}),
	}) as LanguageModel;
}

/** 同じツールを1ステップで2回呼び、次に文章を返すモデル。 */
export function mockRepeatToolModel(toolName: string, answer: string): LanguageModel {
	let step = 0;
	return new MockLanguageModelV3({
		doGenerate: async () => {
			step += 1;
			if (step === 1) {
				return {
					content: [1, 2].map((index) => ({
						type: "tool-call" as const,
						toolCallId: `call-${index}`,
						toolName,
						input: "{}",
					})),
					finishReason: finish("tool-calls"),
					usage: usage(1, 1),
					warnings: [],
				};
			}
			return {
				content: [{ type: "text" as const, text: answer }],
				finishReason: finish("stop"),
				usage: usage(1, 1),
				warnings: [],
			};
		},
	});
}

/**
 * AI SDK のタイムアウトと同じ形(`TimeoutError` という名前の `DOMException`)で
 * abort するモデル。
 *
 * **これは「同期 throw」の近道です。** AI SDK v7 の本物のタイムアウトは
 * graceful abort なので、実経路を踏みたい場合は
 * {@link mockStallingStreamModel} / {@link mockSlowModel} を使ってください。
 */
export function mockTimingOutModel(): LanguageModel {
	const abort = () => {
		throw new DOMException("Total timeout of 20ms exceeded", "TimeoutError");
	};
	return new MockLanguageModelV3({ doGenerate: async () => abort(), doStream: async () => abort() });
}

/**
 * 断片をいくつか流したあと、abort されるまで **黙って止まる** モデル。
 *
 * AI SDK v7 のタイムアウトは **graceful abort** として扱われるため、
 * `textStream` は例外を出さずに静かに終わり、エラーは `result.usage` などの
 * await から出ます。{@link mockTimingOutModel} ではこの経路を再現できないので、
 * ストリーミング時のタイムアウトを確かめるテストはこちらを使ってください。
 *
 * abort されないまま放置されないよう、2秒の保険を持たせています。
 */
export function mockStallingStreamModel(chunks: readonly string[], gap = 1): LanguageModel {
	return new MockLanguageModelV3({
		doStream: async ({ abortSignal }) => ({
			stream: new ReadableStream({
				async start(controller) {
					controller.enqueue({ type: "stream-start", warnings: [] });
					controller.enqueue({ type: "text-start", id: "1" });
					for (const chunk of chunks) {
						await Bun.sleep(gap);
						if (abortSignal?.aborted === true) break;
						controller.enqueue({ type: "text-delta", id: "1", delta: chunk });
					}
					// ここから先は abort されるまで進まない(= タイムアウトさせる)。
					if (abortSignal?.aborted !== true) {
						await new Promise<void>((resolve) => {
							const safety = setTimeout(resolve, 2_000);
							abortSignal?.addEventListener(
								"abort",
								() => {
									clearTimeout(safety);
									resolve();
								},
								{ once: true },
							);
						});
					}
					// abort されていても必ず閉じる(閉じないとストリームの
					// 読み手が終われず、テストが固まってしまう)。
					controller.enqueue({ type: "text-end", id: "1" });
					controller.enqueue({
						type: "finish",
						finishReason: finish("stop"),
						usage: usage(1, chunks.length),
					});
					controller.close();
				},
			}),
		}),
	});
}

/**
 * `abortSignal` を尊重しつつ `ms` かかってから答えるモデル。
 * `timeout` が本当に生成を打ち切るかを、実経路で確かめるのに使います。
 */
export function mockSlowModel(ms: number, text = "おそい"): LanguageModel {
	const wait = (signal: AbortSignal | undefined) =>
		new Promise<void>((resolve, reject) => {
			const timer = setTimeout(resolve, ms);
			signal?.addEventListener(
				"abort",
				() => {
					clearTimeout(timer);
					reject(signal.reason);
				},
				{ once: true },
			);
		});
	return new MockLanguageModelV3({
		doGenerate: async ({ abortSignal }) => {
			await wait(abortSignal);
			return {
				content: [{ type: "text", text }],
				finishReason: finish("stop"),
				usage: usage(1, 1),
				warnings: [],
			};
		},
	});
}

/**
 * 断片を流したあと **error パートを混ぜてから正常に終わる** モデル。
 *
 * 本文が出ているので結果の Promise は解決してしまい、失敗は `onError` に
 * しか来ません。「黙って捨てていないか」を確かめるのに使います。
 */
export function mockPartialErrorModel(
	chunks: readonly string[],
	error: unknown,
): LanguageModel {
	return new MockLanguageModelV3({
		doStream: async () => ({
			stream: new ReadableStream({
				async start(controller) {
					controller.enqueue({ type: "stream-start", warnings: [] });
					controller.enqueue({ type: "text-start", id: "1" });
					for (const chunk of chunks) {
						controller.enqueue({ type: "text-delta", id: "1", delta: chunk });
					}
					controller.enqueue({ type: "error", error });
					controller.enqueue({ type: "text-end", id: "1" });
					controller.enqueue({
						type: "finish",
						finishReason: finish("stop"),
						usage: usage(1, chunks.length),
					});
					controller.close();
				},
			}),
		}),
	});
}

/**
 * ストリームの途中で失敗するモデル。
 * `before` を渡すと、失敗する前にその断片を流します。
 */
export function mockStreamErrorModel(error: unknown, before: readonly string[] = []): LanguageModel {
	return new MockLanguageModelV3({
		doStream: async () => ({
			stream: new ReadableStream({
				async start(controller) {
					controller.enqueue({ type: "stream-start", warnings: [] });
					if (before.length > 0) {
						controller.enqueue({ type: "text-start", id: "1" });
						for (const chunk of before) {
							controller.enqueue({ type: "text-delta", id: "1", delta: chunk });
							await Bun.sleep(1);
						}
					}
					controller.error(error);
				},
			}),
		}),
	});
}

/**
 * `doStream` が HTTP エラーで失敗するモデル(認証切れなどの再現用)。
 *
 * この経路は **ストリームが1断片も出ないまま失敗する** ため、AI SDK v7 は
 * `result.usage` などを cause 無しの `NoOutputGeneratedError` で reject します
 * — 本当の原因は `onError` にしか来ません。
 */
export function mockApiErrorModel(statusCode: number, message: string): LanguageModel {
	const fail = () => {
		throw new APICallError({
			message,
			statusCode,
			url: "https://example.invalid/v1/chat/completions",
			requestBodyValues: {},
			responseBody: JSON.stringify({ detail: message }),
			isRetryable: false,
		});
	};
	return new MockLanguageModelV3({ doGenerate: async () => fail(), doStream: async () => fail() });
}

/**
 * ストリームを正常に終えるが **本文を1文字も返さない** モデル。
 *
 * function calling に対応していないモデルへツールを渡したときの実際の
 * ふるまい(エラーも出さずに空で返る)の再現に使います。
 */
export function mockSilentModel(finishReason: "stop" | "tool-calls" = "stop"): LanguageModel {
	return new MockLanguageModelV3({
		doStream: async () => ({
			stream: new ReadableStream({
				start(controller) {
					controller.enqueue({ type: "stream-start", warnings: [] });
					controller.enqueue({
						type: "finish",
						finishReason: finish(finishReason),
						usage: usage(9, 0),
					});
					controller.close();
				},
			}),
		}),
	});
}

/**
 * 呼び出し側が合図するまで待ってから失敗するモデル。
 * 「いつ失敗するか」を固定したいテスト(クールダウンの払い戻しと
 * 別の呼び出しの競合など)に使います。
 */
export function mockManualFailingModel() {
	let reject!: (error: unknown) => void;
	const gate = new Promise<never>((_, r) => {
		reject = r;
	});
	// 誰も待たないまま fail() されても未処理拒否にならないよう受け止めておく。
	gate.catch(() => undefined);
	const model = new MockLanguageModelV3({
		doGenerate: () => gate,
		doStream: () => gate,
	});
	return { model: model as LanguageModel, fail: (error: unknown) => reject(error) };
}

/** 呼ばれるたびに失敗するモデル。 */
export function mockFailingModel(message: string): LanguageModel {
	return new MockLanguageModelV3({
		doGenerate: async () => {
			throw new Error(message);
		},
		doStream: async () => {
			throw new Error(message);
		},
	});
}

/**
 * 1度ツールを呼び、その結果を受けて文章を返すモデル。
 * `doGenerate` が呼ばれた回数で分岐します。
 */
export function mockToolCallingModel(
	toolName: string,
	input: unknown,
	answer: string,
): LanguageModel {
	let step = 0;
	return new MockLanguageModelV3({
		doGenerate: async () => {
			step += 1;
			if (step === 1) {
				return {
					content: [
						{
							type: "tool-call" as const,
							toolCallId: "call-1",
							toolName,
							input: JSON.stringify(input),
						},
					],
					finishReason: finish("tool-calls"),
					usage: usage(1, 1),
					warnings: [],
				};
			}
			return {
				content: [{ type: "text" as const, text: answer }],
				finishReason: finish("stop"),
				usage: usage(2, 2),
				warnings: [],
			};
		},
	});
}

/** 送られたペイロード(埋め込みは data を覗ける形で保持します)。 */
export interface Sent {
	content?: string;
	embeds?: { data: { description?: string; color?: number; title?: string } }[];
	flags?: number;
	/** `display.allowedMentions`(既定は `{ parse: [] }`)。 */
	allowedMentions?: { parse?: readonly string[]; users?: readonly string[] };
}

/** 偽のインタラクション。`reply()` が実際に触るものだけを備えています。 */
export function fakeInteraction(
	client: Client,
	options: {
		guildId?: string | null;
		channelId?: string;
		userId?: string;
		/** 編集1回にかかる時間(ミリ秒)。編集の重なりを観測するために使います。 */
		editDelay?: number;
		/** 編集を必ず失敗させる(表示が壊れたときのふるまいを見るため)。 */
		failEdits?: boolean;
	} = {},
) {
	const { guildId = "g1", channelId = "c1", userId = "u1", editDelay = 0, failEdits = false } =
		options;
	/** editReply が呼ばれた回数(失敗した分も数えます)。 */
	const attempts = { edits: 0 };
	/** 同時に飛んでいる編集の数の最大値(1 を超えたらコアレスできていない)。 */
	const flight = { current: 0, max: 0 };
	/** editReply されたペイロード(= 途中経過も含む編集の履歴)。 */
	const edits: Sent[] = [];
	/** followUp で追加送信されたペイロード。 */
	const followUps: Sent[] = [];
	/** deferReply に渡されたペイロード。 */
	const defers: (Sent | undefined)[] = [];

	const interaction = {
		client,
		guildId,
		channelId,
		user: { id: userId },
		deferred: false,
		replied: false,
		deferReply: async (payload?: Sent) => {
			defers.push(payload);
			interaction.deferred = true;
			return {};
		},
		reply: async (payload: Sent) => {
			interaction.replied = true;
			edits.push(payload);
			return {};
		},
		editReply: async (payload: Sent) => {
			attempts.edits += 1;
			if (failEdits) throw new Error("編集できません");
			flight.current += 1;
			flight.max = Math.max(flight.max, flight.current);
			try {
				if (editDelay > 0) await Bun.sleep(editDelay);
				edits.push(payload);
				return {};
			} finally {
				flight.current -= 1;
			}
		},
		followUp: async (payload: Sent) => {
			followUps.push(payload);
			return {};
		},
	};

	return { interaction, edits, followUps, defers, flight, attempts };
}

/** ペイロードから本文を取り出します(埋め込みでもプレーンでも同じ形で見たいので)。 */
export function bodyOf(payload: Sent | undefined): string {
	if (!payload) return "";
	return payload.content ?? payload.embeds?.[0]?.data.description ?? "";
}
