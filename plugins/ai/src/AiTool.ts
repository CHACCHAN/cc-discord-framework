import { tool, type FlexibleSchema, type ToolSet } from "ai";
import {
	Component,
	ComponentLoadError,
	ComponentStore,
	defineOptions,
	type Awaitable,
	type ComponentOptions,
	type Message,
	type RepliableInteraction,
} from "cc-discord-framework";
import { AiTimeoutError, messageOf } from "./errors.js";
import { AiEvents, reportAiError } from "./events.js";

/**
 * ツールが「誰の依頼で呼ばれたか」を知るためのコンテキスト。
 * `execute` の第2引数として渡ります。
 */
export interface AiToolContext {
	/** スラッシュコマンド等から呼ばれた場合のインタラクション。 */
	readonly interaction?: RepliableInteraction;
	/** メッセージから呼ばれた場合のメッセージ。 */
	readonly message?: Message;
	/** 呼び出し元のサーバー。DM や判らない場合は `null`。 */
	readonly guildId: string | null;
	/** 呼び出したユーザー。判らなければ `null`。 */
	readonly userId: string | null;
	/** 呼び出し元のチャンネル。判らなければ `null`。 */
	readonly channelId: string | null;
	/**
	 * 中断シグナル。生成が打ち切られたときや `tools.timeout` を超えたときに
	 * abort されます。時間のかかるツールはこれを見て早めに諦めてください。
	 */
	readonly abortSignal?: AbortSignal;
}

export interface AiToolOptions<TInput = unknown> extends ComponentOptions {
	/** モデルへ渡す説明。**必須** — これを読んでモデルが呼ぶか決めます。 */
	description: string;
	/** 入力のスキーマ。**必須** — zod でも JSON Schema でも構いません。 */
	inputSchema: FlexibleSchema<TInput>;
	/**
	 * モデルへ渡す。`false` にすると読み込まれても使われません。
	 * @default true
	 */
	enabled?: boolean;
	/**
	 * サーバー内からの呼び出しでだけ使う。
	 * @default false
	 */
	guildOnly?: boolean;
}

/**
 * LLM から呼べる関数。`ai/` ディレクトリに置くだけで自動ロードされ、
 * モデルへ渡されます。
 *
 * 中では他のコンポーネントと同じように `this.services.*` / `this.container` /
 * `this.logger` が使えます — **これがこのプラグインの核心**で、Bot の機能を
 * そのまま AI から呼べるようにするための入口です。
 *
 * ```ts
 * import { AiTool } from "@cc-discord-framework/ai";
 * import { z } from "zod";
 *
 * const input = z.object({ 詳細: z.boolean().optional() });
 *
 * @AiTool.define({ description: "このサーバーの情報を返します。", inputSchema: input })
 * export class ServerInfoTool extends AiTool<z.infer<typeof input>> {
 *   override async execute(args, context) {
 *     const guild = context.interaction?.guild;
 *     return { name: guild?.name, members: guild?.memberCount };
 *   }
 * }
 * ```
 *
 * ツール名はクラス名から導出されます(`ServerInfoTool` → `server-info`)。
 * `@AiTool.define({ name: "..." })` で明示することもできます。
 */
export abstract class AiTool<TInput = unknown> extends Component {
	/** モデルへ渡す説明。 */
	declare public readonly description: string;

	/** 入力のスキーマ。 */
	declare public readonly inputSchema: FlexibleSchema<TInput>;

	/** モデルへ渡すか。 */
	declare public readonly enabled: boolean;

	/** サーバー内からの呼び出しでだけ使うか。 */
	declare public readonly guildOnly: boolean;

	public static define<TInput>(options: AiToolOptions<TInput>) {
		return defineOptions<AiTool<TInput>>(options);
	}

	/**
	 * ツール本体。戻り値はそのままモデルへ返るので、JSON にできる形に
	 * してください。投げた例外は握りつぶされず、ログと `aiError` を経由して
	 * **エラー内容がモデルへ返ります**(ツール1つの失敗で会話全体が
	 * 止まらないようにするためです)。
	 */
	public abstract execute(input: TInput, context: AiToolContext): Awaitable<unknown>;
}

/** {@link AiTool} のストア。`ai/` を走査します。 */
export class AiToolStore extends ComponentStore<AiTool> {
	public constructor() {
		// ディレクトリ名は `ai/`(`tools/` だと「誰のツールか」が判らないため)。
		// クラス名の接尾辞だけは `Tool` のまま — `NowPlayingTool` → `now-playing`。
		super({ name: "ai", base: AiTool, suffix: "Tool" });
	}

	protected override applyOptions(component: AiTool, options: Partial<AiToolOptions>): void {
		if (typeof options.description !== "string" || options.description.trim().length === 0) {
			throw new ComponentLoadError(
				`AiTool "${component.name}" には description が必要です。` +
					"@AiTool.define({ description, inputSchema }) を付けてください。",
				{ path: component.location },
			);
		}
		if (options.inputSchema === undefined || options.inputSchema === null) {
			throw new ComponentLoadError(
				`AiTool "${component.name}" には inputSchema が必要です。` +
					"@AiTool.define({ description, inputSchema }) を付けてください。",
				{ path: component.location },
			);
		}
		Object.assign(component, {
			description: options.description,
			inputSchema: options.inputSchema,
			enabled: options.enabled ?? true,
			guildOnly: options.guildOnly ?? false,
		});
	}

	/** そのコンテキストで使えるツール(名前順)。 */
	public available(context: AiToolContext): AiTool[] {
		return [...this.values()]
			.filter((component) => component.enabled)
			.filter((component) => !component.guildOnly || context.guildId !== null)
			.sort((a, b) => a.name.localeCompare(b.name));
	}

	/**
	 * 登録済みのツールを AI SDK の {@link ToolSet} へ変換します。
	 *
	 * `execute` の失敗は握りつぶさず、ログと `aiError` を出したうえで
	 * **エラー内容をモデルへ返します** — ツール1つが落ちても会話全体が
	 * 死なないようにするためです。
	 *
	 * @param context ツールへ渡すコンテキスト。
	 * @param timeout 1回の実行を打ち切るまでのミリ秒。`false` で無制限。
	 */
	public toToolSet(context: AiToolContext, timeout: number | false = false): ToolSet {
		const texts = this.container.aiConfig.texts;
		const set: ToolSet = {};

		for (const component of this.available(context)) {
			set[component.name] = tool({
				description: component.description,
				inputSchema: component.inputSchema,
				execute: async (input: unknown, options: { abortSignal?: AbortSignal }) => {
					this.container.client.emit(AiEvents.ToolCall, component, input, context);
					const outer = options.abortSignal ?? context.abortSignal;
					try {
						return await runWithTimeout(
							(signal) => component.execute(input, { ...context, abortSignal: signal }),
							timeout,
							outer,
							(ms) => new AiTimeoutError(texts.toolTimedOut(component.name, ms), ms),
						);
					} catch (error) {
						component.logger.error({ err: error }, "AI ツールの実行に失敗しました");
						reportAiError(this.container.client, component.logger, error, {
							phase: "tool",
							tool: component.name,
							channelId: context.channelId,
							userId: context.userId,
							guildId: context.guildId,
						});
						// モデルが失敗を踏まえて続けられるよう、例外ではなく値で返す。
						return { error: texts.toolFailed(component.name, messageOf(error)) };
					}
				},
			});
		}

		return set;
	}
}

/**
 * 制限時間つきで実行します。時間切れになると `signal` が abort され、
 * `onTimeout` が作ったエラーで reject します。
 */
async function runWithTimeout<T>(
	run: (signal: AbortSignal | undefined) => Awaitable<T>,
	timeout: number | false,
	outer: AbortSignal | undefined,
	onTimeout: (ms: number) => Error,
): Promise<T> {
	if (timeout === false) return await run(outer);

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeout);
	const signal = outer ? AbortSignal.any([outer, controller.signal]) : controller.signal;

	try {
		return await Promise.race([
			Promise.resolve(run(signal)),
			new Promise<never>((_resolve, reject) => {
				controller.signal.addEventListener("abort", () => reject(onTimeout(timeout)), {
					once: true,
				});
			}),
		]);
	} finally {
		clearTimeout(timer);
	}
}
