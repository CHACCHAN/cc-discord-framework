import {
	parseDuration,
	splitMessage,
	truncate,
	type DurationInput,
} from "@cc-discord-framework/utils";
import {
	generateObject,
	generateText,
	stepCountIs,
	streamText,
	type FlexibleSchema,
	type InferSchema,
	type LanguageModel,
	type LanguageModelUsage,
	type ModelMessage,
	type StopCondition,
	type ToolSet,
} from "ai";
import { Message, MessageFlags, Service, type RepliableInteraction } from "cc-discord-framework";
import type { AiToolContext } from "./AiTool.js";
import { aiSplitThreshold, defaultAiConfig, type AiConfig } from "./config.js";
import {
	AiError,
	AiTimeoutError,
	CooldownError,
	describeError,
	ModelNotConfiguredError,
	PromptTooLongError,
	streamFailure,
} from "./errors.js";
import { AiEvents, reportAiError, type AiRequestInfo, type AiResponseInfo } from "./events.js";
import { MapMemoryStore, type AiMemoryStore } from "./memory.js";
import { ModelResolver, type AiModelInput } from "./models.js";
import { renderAiPayload, type AiMessagePayload } from "./render.js";
import type { AiAnswerParts, AiReplyKind, AiSource } from "./texts.js";

/** `generateText` の戻り値(そのまま返します)。 */
export type AiGenerateResult = Awaited<ReturnType<typeof generateText>>;

/** `streamText` の戻り値(そのまま返します)。 */
export type AiStreamResult = ReturnType<typeof streamText>;

/** どのメソッドにも共通のオプション。省略した項目は設定の既定値です。 */
export interface AiCallOptions {
	/** 使うモデル。文字列なら同梱リゾルバ(または `registry`)が解決します。 */
	model?: AiModelInput;
	/** システム指示。`null` で「指示なし」を明示できます。 */
	instructions?: string | null;
	/**
	 * モデルへ渡すツール。省略すると登録済みの {@link AiTool} 全部、
	 * `false` でツールなしになります。
	 */
	tools?: ToolSet | false;
	temperature?: number;
	maxOutputTokens?: number;
	/** ツール呼び出しを含めて何ステップまで回すか。 */
	maxSteps?: number;
	/** 停止条件。指定すると `maxSteps` より優先されます。 */
	stopWhen?: StopCondition<ToolSet> | StopCondition<ToolSet>[];
	abortSignal?: AbortSignal;
	/** 生成を打ち切るまでの時間。`false` で無制限。 */
	timeout?: DurationInput | false;
	/**
	 * 会話履歴のキー(チャンネル ID にすればチャンネル単位)。指定すると
	 * 履歴を前置きし、生成後に追記します。省略・`false` なら一問一答です。
	 */
	history?: string | false;
	/** ツールへ渡すコンテキスト。 */
	context?: Partial<AiToolContext>;
	/** 履歴と入力のあいだへ差し込むメッセージ。 */
	messages?: ModelMessage[];
}

/** {@link AiService.generate} の引数。 */
export interface AiGenerateOptions extends AiCallOptions {
	/** ユーザーの入力。 */
	prompt: string;
}

/** {@link AiService.reply} の宛先。 */
export type AiReplyTarget = RepliableInteraction | Message;

/** {@link AiService.reply} の引数。 */
export interface AiReplyOptions extends AiGenerateOptions {
	/** 途中経過を編集で見せる。省略すると `stream.enabled`。 */
	stream?: boolean;
	/** 本人にだけ見せる。省略すると `display.ephemeral`。 */
	ephemeral?: boolean;
	/** 埋め込みで返す。省略すると `display.embeds`。 */
	embeds?: boolean;
	/** 埋め込みの色に使う意味づけ。 */
	kind?: AiReplyKind;
}

/** {@link AiService.reply} の戻り値。 */
export interface AiReplyResult {
	/**
	 * モデルが返した本文(`limits.maxResponseLength` での切り詰め後)。
	 *
	 * **表示された本文とは限りません** — 引用元などの付随情報は
	 * {@link AiTexts.answerBody} が足しますし、生成に失敗した場合は
	 * 既定ではエラー文言が表示されて、ここには **途中まで生成された本文**
	 * が残ります(失敗して1文字も出ていなければ空文字)。
	 */
	readonly text: string;
	/** トークン数。判らなければ `null`。 */
	readonly usage: LanguageModelUsage | null;
	/** 生成が終わった理由。判らなければ `null`。 */
	readonly finishReason: string | null;
	/** 実際に呼ばれたツールの名前。 */
	readonly toolNames: readonly string[];
	/** 実際に送った編集の回数(途中経過 + 最終)。 */
	readonly edits: number;
	/** 分割して追加送信した通数。 */
	readonly followUps: number;
	/** 生成に失敗した場合のエラー。成功なら `null`。 */
	readonly error: unknown;
}

/** 生成の直前に組み立てた、モデルへ渡す一式。 */
interface PreparedCall {
	readonly model: LanguageModel;
	readonly messages: ModelMessage[];
	readonly instructions?: string;
	readonly temperature?: number;
	readonly maxOutputTokens?: number;
	readonly tools?: ToolSet;
	readonly stopWhen: StopCondition<ToolSet> | StopCondition<ToolSet>[];
	readonly abortSignal?: AbortSignal;
	readonly timeout?: number;
}

/** {@link AiService} の内部で持ち回る、1回の呼び出しの文脈。 */
interface CallContext {
	readonly call: PreparedCall;
	readonly request: AiRequestInfo;
	readonly prompt: string;
	readonly historyKey: string | false;
	readonly toolContext: AiToolContext;
}

/** 送信済みの応答を書き換える口。インタラクションとメッセージの差を吸収します。 */
interface ReplyChannel {
	edit(payload: AiMessagePayload): Promise<unknown>;
	followUp(payload: AiMessagePayload): Promise<unknown>;
}

/**
 * AI 機能のエントリポイント。`this.services.ai` で参照できます。
 *
 * ```ts
 * const answer = await this.services.ai.ask("この Bot の作者は?");
 * await this.services.ai.reply(interaction, { prompt: query, history: interaction.channelId });
 * ```
 *
 * どのメソッドも、省略した項目は `ai({ ... })` の設定へフォールバックします。
 */
@Service.define()
export class AiService extends Service {
	#resolver: ModelResolver | null = null;
	#memory: AiMemoryStore | null = null;
	/** ユーザー ID → 次に使えるようになる時刻(ミリ秒)。 */
	readonly #cooldowns = new Map<string, number>();

	/** このクライアントの ai 設定。 */
	public get config(): AiConfig {
		return this.container.aiConfig ?? defaultAiConfig;
	}

	/**
	 * 会話履歴の置き場。`memory.store` を指定していればそれ、
	 * 指定していなければ Map ベースの既定実装です。
	 */
	public get memory(): AiMemoryStore {
		const { memory } = this.config;
		this.#memory ??=
			memory.store ??
			new MapMemoryStore({ maxMessages: memory.maxMessages, ttl: memory.ttl });
		return this.#memory;
	}

	// ---- モデルとツール ----------------------------------------------------

	/**
	 * モデル指定を解決します。省略すると `ai({ model })` の既定を使い、
	 * それも無ければ {@link ModelNotConfiguredError} を投げます。
	 */
	public async model(id?: AiModelInput): Promise<LanguageModel> {
		const requested = id ?? this.config.model;
		if (requested === null || requested === undefined || requested === "") {
			throw new ModelNotConfiguredError(this.config.texts.modelNotConfigured);
		}
		this.#resolver ??= new ModelResolver({
			providers: this.config.providers,
			registry: this.config.registry,
			texts: this.config.texts,
			loaders: this.config.providerLoaders,
		});
		return this.#resolver.resolve(requested);
	}

	/**
	 * 登録済みの {@link AiTool} から `ToolSet` を作ります。
	 * `tools.enabled: false` なら空です。
	 */
	public tools(context: Partial<AiToolContext> = {}): ToolSet {
		const config = this.config;
		if (!config.tools.enabled) return {};
		const store = this.container.stores.get("ai");
		if (!store) return {};
		return store.toToolSet(resolveToolContext(context), config.tools.timeout);
	}

	// ---- 生成 --------------------------------------------------------------

	/** 一問一答。本文だけを返します。 */
	public async ask(prompt: string, options: AiCallOptions = {}): Promise<string> {
		const result = await this.generate({ ...options, prompt });
		return result.text;
	}

	/**
	 * `generateText` の薄いラッパ。結果をそのまま返します。
	 * `history` を指定した場合は、終わったあとに履歴へ追記します。
	 */
	public async generate(options: AiGenerateOptions): Promise<AiGenerateResult> {
		const context = await this.#prepare(options);
		this.client.emit(AiEvents.Request, context.request);

		const result = await this.#run(() => generateText(context.call), context);
		const toolNames = uniqueToolNames(result.toolCalls);
		await this.#complete(context, result.text, result.usage, result.finishReason, toolNames);
		return result;
	}

	/**
	 * `streamText` の薄いラッパ。結果をそのまま返します。
	 *
	 * **履歴の追記は行いません** — いつ生成が終わるかは、ストリームを
	 * 読んでいる呼び出し側にしか判らないためです。追記したい場合は
	 * `this.services.ai.memory.append(key, ...)` を使うか、
	 * 表示まで面倒を見る {@link AiService.reply} を使ってください。
	 */
	public async stream(options: AiGenerateOptions): Promise<AiStreamResult> {
		const context = await this.#prepare(options);
		this.client.emit(AiEvents.Request, { ...context.request, streaming: true });
		// AI SDK v7 は失敗を `textStream` へ流さないので、ここで拾わないと
		// 呼び出し側に届かないまま消えます。ログと `aiError` には必ず出します
		// (返すのは `streamText` の結果そのままなので、扱いは呼び出し側の自由)。
		return streamText({
			...context.call,
			onError: ({ error }) => this.#report(error, "generate", context.toolContext),
		});
	}

	/** `generateObject` で構造化データを取り出します。 */
	public async object<SCHEMA extends FlexibleSchema>(
		schema: SCHEMA,
		prompt: string,
		options: AiCallOptions = {},
	): Promise<InferSchema<SCHEMA>> {
		// ツールも停止条件も使わないので、渡すのは生成そのものの設定だけ。
		const context = await this.#prepare({ ...options, prompt, tools: false });
		this.client.emit(AiEvents.Request, context.request);

		// `generateObject` は `timeout` を受け取らない(ai v7 では
		// `Omit<RequestOptions, "timeout">`)ので、ここだけ自前で作ります。
		const abortSignal = abortSignalOf(context.call);

		const result = await this.#run(
			() =>
				generateObject({
					model: context.call.model,
					messages: context.call.messages,
					schema: schema as FlexibleSchema<unknown>,
					...(context.call.instructions === undefined
						? {}
						: { instructions: context.call.instructions }),
					...(context.call.temperature === undefined
						? {}
						: { temperature: context.call.temperature }),
					...(context.call.maxOutputTokens === undefined
						? {}
						: { maxOutputTokens: context.call.maxOutputTokens }),
					...(abortSignal === undefined ? {} : { abortSignal }),
				}),
			context,
		);
		await this.#complete(
			context,
			JSON.stringify(result.object),
			result.usage,
			result.finishReason,
			[],
		);
		return result.object as InferSchema<SCHEMA>;
	}

	// ---- Discord への表示 --------------------------------------------------

	/**
	 * Discord へ **ストリーミング表示しながら** 答えます。
	 *
	 * 1. まだなら `deferReply()`(メッセージ宛なら仮のメッセージを送信)
	 * 2. 生成しながら `stream.intervalMs` ごとに1回だけ編集
	 *    (前回と同じ内容ならスキップ・編集が飛行中ならスキップ)
	 * 3. 途中経過が `display.splitThreshold` を超えたら **切り詰める**
	 *    (進捗表示なので分割はしません)
	 * 4. 完了したら最終の内容へ編集し、超えていれば **分割して** 追加送信
	 *
	 * `stream.enabled: false` なら「完成してから1回だけ送る」動作になります。
	 *
	 * `display.splitThreshold` を明示していない場合、分割位置は
	 * **この呼び出しで実際に使う `embeds`** から決まります。
	 *
	 * **生成の失敗は throw せず、応答へ表示します**(すでに Discord の応答を
	 * 引き受けているため)。検知したい場合は `aiError` を購読するか、
	 * 戻り値の `error` を見てください。入力が長すぎる・クールダウン中・
	 * モデル未設定といった **表示を引き受ける前の失敗** はそのまま throw
	 * するので、フレームワークの既定処理が返信します。
	 */
	public async reply(target: AiReplyTarget, options: AiReplyOptions): Promise<AiReplyResult> {
		const config = this.config;
		const { texts, limits, display } = config;
		const toolContext = resolveToolContext({ ...contextFromTarget(target), ...options.context });

		// --- 表示を引き受ける前に済ませる確認(ここでの失敗は throw する) ---
		this.#checkPrompt(options.prompt);
		// クールダウンは **先に刻む**(応答を待つあいだの連打も同じ入口で
		// 弾くため)。ただし失敗して本文を1文字も届けられなかった呼び出しは
		// 利用として数えず、あとで払い戻します。
		const refundCooldown = this.#chargeCooldown(toolContext.userId);

		const streaming = options.stream ?? config.stream.enabled;
		const ephemeral = options.ephemeral ?? display.ephemeral;
		const embeds = options.embeds ?? display.embeds;
		const kind = options.kind ?? "info";
		// 分割位置は「この呼び出しで実際に使う表示方法」から決める
		// (`embeds` を呼び出しごとに上書きしても位置がずれないように)。
		const splitThreshold = aiSplitThreshold(display, embeds);

		const compose = (parts: Partial<AiAnswerParts> & { answer: string }): string =>
			texts.answerBody(
				{
					cursor: null,
					sources: [],
					tools: [],
					usage: null,
					rawSources: [],
					rawTools: [],
					rawUsage: null,
					streaming: false,
					failure: null,
					...parts,
				},
				texts,
			);
		const payloadOf = (
			body: string,
			bodyKind: AiReplyKind = kind,
			position: { index?: number; total?: number; streaming?: boolean } = {},
		): AiMessagePayload =>
			renderAiPayload(target, body, bodyKind, {
				embeds,
				index: position.index ?? 1,
				total: position.total ?? 1,
				streaming: position.streaming ?? false,
			});

		let model: LanguageModel;
		let channel: ReplyChannel;
		try {
			model = await this.model(options.model);
			channel = await openReply(target, ephemeral, () =>
				// 仮のメッセージはあとで書き換わるので「途中経過」扱い。
				payloadOf(compose({ answer: "" }), kind, { streaming: true }),
			);
		} catch (error) {
			// まだ何も表示できていない失敗(モデル未設定・API キー不足・
			// defer の失敗など)。throw してフレームワークの既定処理へ任せる
			// ので、クールダウンも消費させません。
			refundCooldown();
			throw error;
		}

		let answer = "";
		let edits = 0;
		let followUps = 0;
		let usage: LanguageModelUsage | null = null;
		let finishReason: string | null = null;
		let toolNames: readonly string[] = [];
		/** モデルへ渡したツールの数(空の応答の切り分けに使います)。 */
		let toolCount = 0;
		let sources: readonly AiSource[] = [];
		let failure: unknown = null;

		/** 表示の失敗を1度でも見たら、以降の途中経過は撃たない。 */
		let displayBroken = false;
		/** 飛行中の編集。これがある間は次を撃たない(コアレス)。 */
		let pending: Promise<void> | null = null;
		let lastBody: string | null = null;
		/**
		 * 直前に編集を撃った時刻。`0` で始めるので **最初の断片はすぐ出ます**
		 * (最初の1回だけ間隔を待たない = 反応が速く見える)。
		 */
		let lastAt = 0;

		const push = (body: string): void => {
			lastBody = body;
			edits += 1;
			// ペイロードの組み立て(埋め込みの上限や `decorate` / `payload`)は
			// **同期に throw しうる**。ここで外へ出すと蓄積した本文ごと失われる
			// ので、必ずこの中で受け止めて次の周期へ進みます。
			pending = (async () => {
				await channel.edit(payloadOf(body, kind, { streaming: true }));
			})()
				.catch((error: unknown) => {
					displayBroken = true;
					this.#report(error, "display", toolContext);
				})
				.finally(() => {
					pending = null;
				});
		};

		try {
			const context = await this.#prepare({
				...options,
				model,
				context: toolContext,
			});
			this.client.emit(AiEvents.Request, { ...context.request, streaming });
			toolCount = Object.keys(context.call.tools ?? {}).length;

			if (streaming) {
				// 失敗は `textStream` からは出てこない(v7 は `onError` と
				// `fullStream` の error パートにだけ流す)。捕まえておかないと
				// 結果の Promise が cause を持たない `NoOutputGeneratedError` で
				// reject し、401 などの本当の原因が消えます。
				let captured: unknown = null;
				const result = streamText({
					...context.call,
					onError: ({ error }) => {
						captured ??= error;
					},
				});
				for await (const delta of this.#tracked(result.textStream, context)) {
					answer += delta;
					if (displayBroken || pending !== null) continue;
					const now = Date.now();
					if (now - lastAt < config.stream.intervalMs) continue;
					// 途中経過は「進捗表示」なので、上限を超えたら切り詰めるだけ
					// (分割するのは最終出力だけ)。切り詰めないと Discord の
					// 上限を超えた時点で組み立てが失敗し、回答ごと失われます。
					const body = truncate(
						compose({
							answer,
							cursor: config.stream.cursor.length > 0 ? config.stream.cursor : null,
							streaming: true,
						}),
						splitThreshold,
						texts.truncated,
					);
					if (body === lastBody) continue;
					lastAt = now;
					push(body);
				}
				// タイムアウトは AI SDK v7 では **graceful abort** として扱われ、
				// `textStream` は静かに終わって例外はここから出ます。
				// `#run()` を通さないと `texts.timedOut` が効きません。
				const [finalUsage, finalReason, finalCalls, finalSources] = await this.#run(
					() =>
						Promise.all([
							result.usage,
							result.finishReason,
							result.toolCalls,
							result.sources,
						]).catch((error: unknown) => {
							// 消えた原因を取り戻してから `#run` のタイムアウト
							// 判定へ渡す(捕まえた側が時間切れのこともある)。
							throw streamFailure(error, captured);
						}),
					context,
				);
				// 本文が出ていれば、途中で失敗しても Promise は解決します。
				// その失敗を黙って捨てないよう、ログと `aiError` には出します。
				if (captured !== null) this.#report(captured, "generate", toolContext);
				usage = finalUsage;
				finishReason = finalReason;
				toolNames = uniqueToolNames(finalCalls);
				sources = finalSources;
			} else {
				const result = await this.#run(() => generateText(context.call), context);
				answer = result.text;
				usage = result.usage;
				finishReason = result.finishReason;
				toolNames = uniqueToolNames(result.toolCalls);
				sources = result.sources;
			}

			await this.#complete(context, answer, usage, finishReason, toolNames);
		} catch (error) {
			failure = error;
			this.#report(error, "generate", toolContext);
		}

		// 失敗して本文が1文字も出ていなければ、クールダウンを払い戻す
		// (プロバイダー障害のあいだユーザーを締め出さないため)。
		// 途中まで表示できた応答は利用として数えるので払い戻しません。
		if (failure !== null && answer.length === 0) refundCooldown();

		// 飛行中の編集を必ず待ってから最終表示へ進む(2つ同時に撃たない)。
		if (pending) await pending;

		// 空の応答は「モデルが黙った」だけとは限りません。**function calling に
		// 対応していないモデルへツールを渡すと、エラーも出さずに空で返る**
		// 相手が実際にあります(それだと `texts.emptyResponse` を見ても
		// 原因が判りません)。ユーザーへの文言は変えず、切り分けに要る事実だけ
		// ログへ残します。
		if (answer.length === 0 && failure === null) {
			this.logger.warn(
				{ finishReason, toolCount, toolNames, streaming, usage },
				toolCount > 0
					? "モデルが本文を返しませんでした(ツールを渡しています — 対応していないモデルでは空で返ることがあります)"
					: "モデルが本文を返しませんでした",
			);
		}
		if (answer.length === 0) answer = failure === null ? texts.emptyResponse : "";
		if (limits.maxResponseLength !== false && answer.length > limits.maxResponseLength) {
			answer = truncate(answer, limits.maxResponseLength, texts.truncated);
		}

		// 失敗した場合も `answerBody` を通す(途中まで出ていた本文を残したり、
		// 失敗時もヘッダーを付けたりできるように)。既定の実装はエラー文言だけ
		// を出すので、何も指定しなければ表示は今までどおりです。
		const body = compose({
			answer,
			failure: failure === null ? null : texts.generationFailed(describeError(failure, texts)),
			sources: sources.map((source, index) =>
				texts.sourceLine(index + 1, sourceTitle(source), sourceUrl(source)),
			),
			tools: toolNames.map((name) => texts.toolLine(name)),
			usage: usage === null ? null : formatUsage(usage, texts.usageLine),
			rawSources: sources,
			rawTools: toolNames,
			rawUsage: usage,
		});

		try {
			const parts = splitMessage(body, { max: splitThreshold });
			const [first = texts.emptyResponse, ...rest] = parts;
			const total = Math.max(parts.length, 1);
			const bodyKind: AiReplyKind = failure === null ? kind : "error";
			await channel.edit(payloadOf(first, bodyKind, { index: 1, total }));
			edits += 1;
			for (const [offset, part] of rest.entries()) {
				await channel.followUp(payloadOf(part, bodyKind, { index: offset + 2, total }));
				followUps += 1;
			}
		} catch (error) {
			this.#report(error, "display", toolContext);
		}

		return { text: answer, usage, finishReason, toolNames, edits, followUps, error: failure };
	}

	// ---- 会話履歴 ----------------------------------------------------------

	/**
	 * そのキーの会話履歴を古い順に返します。キーは呼び出し側が決めます
	 * (チャンネル ID にすればチャンネル単位、`"<チャンネル>:<ユーザー>"`
	 * にすればユーザー単位)。
	 * `memory.maxMessages` を超える分と、`memory.enabled: false` のときは空です。
	 */
	public async history(key: string): Promise<ModelMessage[]> {
		const { memory } = this.config;
		if (!memory.enabled || memory.maxMessages <= 0) return [];
		const messages = await this.memory.get(key);
		return messages.slice(-memory.maxMessages);
	}

	/**
	 * そのキーの会話履歴を消します。消すものがあったかを返します。
	 * `reply()` / `generate()` の `history` に渡したのと同じキーを渡してください。
	 */
	public async forget(key: string): Promise<boolean> {
		const had = (await this.memory.get(key)).length > 0;
		await this.memory.clear(key);
		return had;
	}

	override onUnload(): void {
		this.#cooldowns.clear();
		this.#resolver = null;
		this.#memory = null;
	}

	// ---- 内部 --------------------------------------------------------------

	/** 呼び出し1回分の設定を組み立てます。 */
	async #prepare(options: AiGenerateOptions): Promise<CallContext> {
		const config = this.config;
		this.#checkPrompt(options.prompt);

		const model = await this.model(options.model);
		const toolContext = resolveToolContext(options.context ?? {});
		const tools =
			options.tools === false ? undefined : (options.tools ?? this.tools(toolContext));
		const instructions =
			options.instructions === undefined ? config.instructions : options.instructions;
		const temperature = options.temperature ?? config.temperature;
		const maxOutputTokens = options.maxOutputTokens ?? config.maxOutputTokens;
		const timeout =
			options.timeout === undefined
				? config.timeout
				: options.timeout === false
					? false
					: parseDuration(options.timeout);

		const historyKey = config.memory.enabled ? (options.history ?? false) : false;
		const past = historyKey === false ? [] : await this.#recall(historyKey, toolContext);
		const messages: ModelMessage[] = [
			...past,
			...(options.messages ?? []),
			{ role: "user", content: options.prompt },
		];

		const call: PreparedCall = {
			model,
			messages,
			...(instructions === null ? {} : { instructions }),
			...(temperature === null ? {} : { temperature }),
			...(maxOutputTokens === null ? {} : { maxOutputTokens }),
			...(tools && Object.keys(tools).length > 0 ? { tools } : {}),
			stopWhen: options.stopWhen ?? stepCountIs(options.maxSteps ?? config.maxSteps),
			...(options.abortSignal === undefined ? {} : { abortSignal: options.abortSignal }),
			...(timeout === false ? {} : { timeout }),
		};

		return {
			call,
			prompt: options.prompt,
			historyKey,
			toolContext,
			request: {
				prompt: options.prompt,
				channelId: toolContext.channelId,
				userId: toolContext.userId,
				guildId: toolContext.guildId,
				streaming: false,
				toolNames: Object.keys(call.tools ?? {}),
			},
		};
	}

	/** 履歴へ追記して `aiResponse` を発火します。 */
	async #complete(
		context: CallContext,
		text: string,
		usage: LanguageModelUsage | null,
		finishReason: string | null,
		toolNames: readonly string[],
	): Promise<void> {
		if (context.historyKey !== false && text.length > 0) {
			try {
				await this.memory.append(context.historyKey, [
					{ role: "user", content: context.prompt },
					{ role: "assistant", content: text },
				]);
			} catch (error) {
				this.#report(error, "memory", context.toolContext);
			}
		}

		const response: AiResponseInfo = { text, usage, finishReason, toolNames };
		this.client.emit(AiEvents.Response, response, context.request);
	}

	/** 履歴の読み出し。失敗しても生成そのものは続けます。 */
	async #recall(key: string, context: AiToolContext): Promise<ModelMessage[]> {
		try {
			return await this.history(key);
		} catch (error) {
			this.#report(error, "memory", context);
			return [];
		}
	}

	/**
	 * 生成を走らせ、タイムアウトのエラーだけ差し替え可能な文言へ置き換えます。
	 *
	 * AI SDK は `timeout` を超えると `TimeoutError` という名前の `DOMException`
	 * で abort します。そのままだと文言が固定されてしまうので、
	 * `texts.timedOut` を使う {@link AiTimeoutError} へ包み直します。
	 */
	async #run<T>(run: () => Promise<T>, context: CallContext): Promise<T> {
		try {
			return await run();
		} catch (error) {
			throw this.#asTimeout(error, context);
		}
	}

	/** ストリームの消費中に出たタイムアウトも同じように包み直します。 */
	async *#tracked(
		stream: AsyncIterable<string>,
		context: CallContext,
	): AsyncGenerator<string> {
		try {
			for await (const delta of stream) yield delta;
		} catch (error) {
			throw this.#asTimeout(error, context);
		}
	}

	/**
	 * タイムアウト由来のエラーなら {@link AiTimeoutError} へ、そうでなければ
	 * そのまま返します。**呼び出し側が自分で abort した場合は触りません**
	 * (中断とタイムアウトを混同しないため)。
	 */
	#asTimeout(error: unknown, context: CallContext): unknown {
		const timeout = context.call.timeout;
		if (timeout === undefined) return error;
		if (context.call.abortSignal?.aborted === true) return error;
		if (!isTimeoutError(error)) return error;
		return new AiTimeoutError(this.config.texts.timedOut(timeout), timeout);
	}

	#checkPrompt(prompt: string): void {
		const { texts, limits } = this.config;
		if (prompt.trim().length === 0) throw new AiError(texts.promptEmpty);
		if (prompt.length > limits.maxPromptLength) {
			throw new PromptTooLongError(
				texts.promptTooLong(prompt.length, limits.maxPromptLength),
				prompt.length,
				limits.maxPromptLength,
			);
		}
	}

	/**
	 * クールダウンを確認し、期限内なら {@link CooldownError} を投げます。
	 *
	 * 通った場合は **その場で次の期限を刻みます** — 生成を待つあいだの
	 * 連打も同じ入口で弾くためです。戻り値は払い戻し関数で、呼ぶと
	 * **刻む前の状態へ正確に** 戻します(以前の期限が残っていればそれへ、
	 * 無ければ消します)。失敗して何も届けられなかった呼び出しを
	 * 利用として数えないために使います。別の呼び出しが期限を刻み直して
	 * いた場合は、その期限を消さないよう何もしません。
	 */
	#chargeCooldown(userId: string | null): () => void {
		const { texts, limits } = this.config;
		if (limits.cooldown === false || userId === null) return () => undefined;

		const now = Date.now();
		const previous = this.#cooldowns.get(userId);
		const until = previous ?? 0;
		if (now < until) {
			throw new CooldownError(texts.cooldown(until - now), until - now);
		}
		const charged = now + limits.cooldown;
		this.#cooldowns.set(userId, charged);
		return () => {
			if (this.#cooldowns.get(userId) !== charged) return;
			if (previous === undefined) this.#cooldowns.delete(userId);
			else this.#cooldowns.set(userId, previous);
		};
	}

	#report(error: unknown, phase: "generate" | "display" | "memory", context: AiToolContext): void {
		reportAiError(this.client, this.logger, error, {
			phase,
			tool: null,
			channelId: context.channelId,
			userId: context.userId,
			guildId: context.guildId,
		});
	}
}

// ---- 補助 ------------------------------------------------------------------

/** 部分指定のコンテキストを埋めます。 */
function resolveToolContext(context: Partial<AiToolContext>): AiToolContext {
	return {
		...context,
		guildId: context.guildId ?? null,
		userId: context.userId ?? null,
		channelId: context.channelId ?? null,
	};
}

/** 宛先から「誰の依頼か」を読み取ります。 */
function contextFromTarget(target: AiReplyTarget): AiToolContext {
	if (target instanceof Message) {
		return {
			message: target,
			guildId: target.guildId,
			userId: target.author.id,
			channelId: target.channelId,
		};
	}
	return {
		interaction: target,
		guildId: target.guildId,
		userId: target.user.id,
		channelId: target.channelId,
	};
}

/**
 * 応答を引き受けて、書き換え口を返します。
 * インタラクションは `deferReply()`、メッセージは仮の返信を1通送ります。
 */
async function openReply(
	target: AiReplyTarget,
	ephemeral: boolean,
	// 仮のメッセージが要るのはメッセージ宛のときだけなので、遅延で受け取る
	// (インタラクションでは送らないペイロードを組み立てない = decorate も呼ばない)。
	initial: () => AiMessagePayload,
): Promise<ReplyChannel> {
	if (target instanceof Message) {
		const sent = await target.reply(initial());
		return {
			edit: (payload) => sent.edit(payload),
			followUp: (payload) => target.reply(payload),
		};
	}

	if (!target.deferred && !target.replied) {
		await target.deferReply(ephemeral ? { flags: MessageFlags.Ephemeral } : {});
	}
	return {
		edit: (payload) => target.editReply(payload),
		followUp: (payload) =>
			target.followUp(ephemeral ? { ...payload, flags: MessageFlags.Ephemeral } : payload),
	};
}

/**
 * `timeout` を受け取らない API(`generateObject`)へ渡す中断シグナル。
 *
 * `AbortSignal.timeout()` は `TimeoutError` という名前の `DOMException` で
 * abort するので、`streamText` / `generateText` の `timeout` と同じ形になり、
 * {@link AiService.#asTimeout} がそのまま {@link AiTimeoutError} へ包み直せます。
 * 呼び出し側が `abortSignal` を渡している場合は合成します。
 */
function abortSignalOf(call: PreparedCall): AbortSignal | undefined {
	const signals: AbortSignal[] = [];
	if (call.abortSignal !== undefined) signals.push(call.abortSignal);
	if (call.timeout !== undefined) signals.push(AbortSignal.timeout(call.timeout));
	if (signals.length === 0) return undefined;
	return signals.length === 1 ? signals[0] : AbortSignal.any(signals);
}

/**
 * AI SDK のタイムアウト由来のエラーか。
 * SDK は `new DOMException("... timeout of Nms exceeded", "TimeoutError")` で
 * abort するので、その名前(と1段の cause)を見ます。
 */
function isTimeoutError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	if (error.name === "TimeoutError") return true;
	return error.cause instanceof Error && error.cause.name === "TimeoutError";
}

/** 呼ばれたツール名を重複なく、呼ばれた順で取り出します。 */
function uniqueToolNames(calls: readonly { toolName: string }[]): string[] {
	return [...new Set(calls.map((call) => call.toolName))];
}

function sourceTitle(source: AiSource): string {
	if ("title" in source && typeof source.title === "string" && source.title.length > 0) {
		return source.title;
	}
	return "url" in source ? source.url : source.id;
}

function sourceUrl(source: AiSource): string | null {
	return "url" in source ? source.url : null;
}

function formatUsage(
	usage: LanguageModelUsage,
	line: (input: number | null, output: number | null, total: number | null) => string,
): string {
	return line(usage.inputTokens ?? null, usage.outputTokens ?? null, usage.totalTokens ?? null);
}

declare module "cc-discord-framework" {
	interface Services {
		ai: AiService;
	}
}
