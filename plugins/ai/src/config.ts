/**
 * 解決済みのプラグイン設定。
 *
 * モジュールレベルの可変状態にせず **コンテナ経由** で配るため、
 * 1プロセスに複数クライアントがあっても設定が混ざりません。
 *
 * 文言・記号・間隔・上限は既定値を持つだけで、すべて `ai({ ... })` から
 * 差し替えられます。変更できない値は残していません。
 */
import {
	EMBED_DESCRIPTION_LIMIT,
	MESSAGE_LIMIT,
	parseDuration,
	type DurationInput,
} from "@cc-discord-framework/utils";
import type { EmbedBuilder, MessageMentionOptions } from "@cc-discord-framework/core";
import type { AiMemoryStore } from "./memory.js";
import type { AiModelInput, AiProviderLoader, AiProviders, AiRegistry } from "./models.js";
import { builtinProviders } from "./models.js";
import type { AiMessagePayload, AiPayloadContext } from "./render.js";
import { resolveAiTexts, type AiReplyKind, type AiTexts, type AiTextsOptions } from "./texts.js";

/** ツール(`ai/`)の扱い。 */
export interface AiToolsConfig {
	/** 登録済みの {@link AiTool} を既定でモデルへ渡す。`false` で無効。 */
	readonly enabled: boolean;
	/** 1回のツール実行を打ち切るまでのミリ秒。`false` で無制限。 */
	readonly timeout: number | false;
}

/** 会話履歴の扱い。 */
export interface AiMemoryConfig {
	/** 履歴を使う。 */
	readonly enabled: boolean;
	/** 保持するメッセージ数。超えた分は古いものから捨てます。 */
	readonly maxMessages: number;
	/** 最後の書き込みからの有効期間(ミリ秒)。`false` で無期限。 */
	readonly ttl: number | false;
	/**
	 * 保存先。省略すると Map ベースの既定実装({@link MapMemoryStore})です。
	 * Redis や DB に置きたい場合はここへ差し替えてください。
	 */
	readonly store?: AiMemoryStore;
}

/**
 * Discord へのストリーミング表示。
 *
 * 既定値は Discord の制限に合わせています — インタラクション応答の編集は
 * おおよそ **5秒あたり5回** までなので、1.2秒間隔なら安全圏です。
 */
export interface AiStreamConfig {
	/** 生成中の途中経過を編集で見せる。`false` なら完成してから1回だけ送ります。 */
	readonly enabled: boolean;
	/** 編集の最短間隔(ミリ秒)。 */
	readonly intervalMs: number;
	/** 生成中に本文の末尾へ添える記号。空文字にすると何も添えません。 */
	readonly cursor: string;
}

/** 数量の上限。 */
export interface AiLimits {
	/** 受け付ける入力の最大文字数。 */
	readonly maxPromptLength: number;
	/** 表示する応答の最大文字数。超えた分は切り詰めます。`false` で無制限。 */
	readonly maxResponseLength: number | false;
	/**
	 * 同じユーザーが続けて {@link AiService.reply} を呼べるまでのミリ秒。
	 * `false` で無制限。
	 *
	 * **失敗した呼び出しは数えません**(モデル未設定やプロバイダー障害など
	 * で本文を1文字も届けられなかった場合は払い戻されます)。途中まで
	 * 表示できた応答は数えます。
	 */
	readonly cooldown: number | false;
}

/** 応答の見せ方。 */
export interface AiDisplayConfig {
	/** 応答を埋め込みで返す。`false` でプレーンテキスト。 */
	readonly embeds: boolean;
	/** 応答を本人にだけ見える形にする。 */
	readonly ephemeral: boolean;
	/**
	 * 1通に収める最大文字数。超えた分は分割して2通目以降へ送ります。
	 *
	 * 既定の `"auto"` は **その呼び出しで実際に使う表示方法** から
	 * Discord の上限を選びます(埋め込みなら 4096、プレーンテキストなら
	 * 2000)。`reply(interaction, { embeds: false })` のように呼び出しごとに
	 * 表示方法を変えても分割位置がずれません。
	 *
	 * 数値を指定すると、表示方法にかかわらずその値を使います。ただし
	 * 明示した値でも、埋め込みなら 4096、プレーンテキストなら 2000 を
	 * 超えた分は上限に丸められます(超えた指定は必ず送信に失敗するため)。
	 * 実際に使われる値は {@link aiSplitThreshold} で解決します。
	 */
	readonly splitThreshold: number | "auto";
	/**
	 * 応答のメンションをどこまで解決するか。`null` を渡すと discord.js の
	 * 既定(本文に書かれたメンションはすべて解決される)に任せます。
	 *
	 * **既定は `{ parse: [] }` = どのメンションも解決しません。** モデルの
	 * 出力をそのまま本文へ流すため、既定のままだとプロンプトインジェクション
	 * で `@everyone` を書かれても発火しません。許可する場合は明示してください。
	 */
	readonly allowedMentions: MessageMentionOptions | null;
	/**
	 * 応答の埋め込みに手を入れるフック。title・footer・timestamp などを
	 * 足したい場合に使います。返した EmbedBuilder が送られます。
	 *
	 * **埋め込み経路でだけ**呼ばれます(`embeds: false` のときは通りません)。
	 * どちらの経路でも通したい場合は {@link AiDisplayConfig.payload} を
	 * 使ってください。
	 * @default 何もしない
	 */
	readonly decorate?: (embed: EmbedBuilder, kind: AiReplyKind) => EmbedBuilder;
	/**
	 * 送信ペイロードそのものに手を入れるフック。
	 *
	 * **埋め込み経路とプレーンテキスト経路の両方で、送信直前に必ず**
	 * 通ります(`decorate` より後)。`components` を足す・
	 * `allowedMentions` を1通だけ変える・分割された2通目以降だけ
	 * 見た目を変える、といったことができます。
	 * @default 何もしない
	 */
	readonly payload?: (payload: AiMessagePayload, context: AiPayloadContext) => AiMessagePayload;
}

export interface AiConfig {
	/** 既定のモデル。未設定なら呼び出しごとに指定が要ります。 */
	readonly model: AiModelInput | null;
	/** 自前のプロバイダーレジストリ。 */
	readonly registry: AiRegistry | null;
	/** プロバイダーの接続設定。 */
	readonly providers: AiProviders;
	/**
	 * 文字列のモデル指定を解決できるプロバイダーの一覧
	 * ({@link builtinProviders} に `providerLoaders` を重ねたもの)。
	 */
	readonly providerLoaders: Readonly<Record<string, AiProviderLoader>>;
	/** 既定のシステム指示。 */
	readonly instructions: string | null;
	/** 既定の温度。`null` ならプロバイダーの既定。 */
	readonly temperature: number | null;
	/** 既定の最大出力トークン数。`null` ならプロバイダーの既定。 */
	readonly maxOutputTokens: number | null;
	/** ツール呼び出しを含めて何ステップまで回すか。 */
	readonly maxSteps: number;
	/** 1回の生成を打ち切るまでのミリ秒。`false` で無制限。 */
	readonly timeout: number | false;
	/** ツール(`ai/`)の扱い。 */
	readonly tools: AiToolsConfig;
	/** 会話履歴の扱い。 */
	readonly memory: AiMemoryConfig;
	/** Discord へのストリーミング表示。 */
	readonly stream: AiStreamConfig;
	/** 数量の上限。 */
	readonly limits: AiLimits;
	/** 応答の見せ方。 */
	readonly display: AiDisplayConfig;
	/** ユーザーに見える文言。 */
	readonly texts: AiTexts;
}

/** {@link AiMemoryConfig} の部分指定。`ttl` は期間表記でも書けます。 */
export interface AiMemoryOptions {
	/** @default true */
	enabled?: boolean;
	/** @default 20 */
	maxMessages?: number;
	/** @default "1h" */
	ttl?: DurationInput | false;
	/** @default Map ベースの既定実装 */
	store?: AiMemoryStore;
}

/** {@link AiToolsConfig} の部分指定。`timeout` は期間表記でも書けます。 */
export interface AiToolsOptions {
	/** @default true */
	enabled?: boolean;
	/** @default "30s" */
	timeout?: DurationInput | false;
}

/** {@link AiLimits} の部分指定。`cooldown` は期間表記でも書けます。 */
export interface AiLimitsOptions {
	/** @default 4000 */
	maxPromptLength?: number;
	/** @default false(無制限) */
	maxResponseLength?: number | false;
	/** @default false(クールダウンなし) */
	cooldown?: DurationInput | false;
}

/** {@link AiDisplayConfig} の部分指定。 */
export interface AiDisplayOptions {
	/** @default true */
	embeds?: boolean;
	/** @default false */
	ephemeral?: boolean;
	/**
	 * 明示した値でも、埋め込みなら 4096、プレーンテキストなら 2000 を
	 * 超えた分は上限に丸められます(超えた指定は必ず送信に失敗するため)。
	 * @default 埋め込みなら 4096、プレーンテキストなら 2000
	 * (指定しなければ、呼び出しごとの `embeds` 上書きにも追従します)
	 */
	splitThreshold?: number;
	/**
	 * メンションの解決範囲。`null` で discord.js の既定に任せます。
	 * @default `{ parse: [] }`(どのメンションも解決しない)
	 */
	allowedMentions?: MessageMentionOptions | null;
	/** @default 未設定(何もしない) */
	decorate?: (embed: EmbedBuilder, kind: AiReplyKind) => EmbedBuilder;
	/** @default 未設定(何もしない) */
	payload?: (payload: AiMessagePayload, context: AiPayloadContext) => AiMessagePayload;
}

/**
 * {@link AiConfig} の部分指定。指定しなかった項目は既定値のままです。
 * `ai()` のオプションはこれを受け取ります。
 */
export interface AiConfigOptions {
	/**
	 * 既定のモデル。`"<プロバイダー>:<モデルID>"` の文字列か、
	 * SDK が返す `LanguageModel` をそのまま渡します。
	 *
	 * **既定値はありません。** 勝手に課金される先を既定にしないためで、
	 * 未設定のまま使うと「設定してください」というエラーになります。
	 * @default null
	 */
	model?: AiModelInput | null;
	/**
	 * 自前のプロバイダーレジストリ(`createProviderRegistry()` の戻り値)。
	 * 指定すると、文字列のモデル指定はすべてこれで解決されます。
	 * @default null
	 */
	registry?: AiRegistry | null;
	/**
	 * プロバイダーの接続設定。API キーを省略すると各 SDK の既定の
	 * 環境変数が使われます。
	 * @default {}
	 */
	providers?: AiProviders;
	/**
	 * 文字列のモデル指定で使えるプロバイダーを足す・差し替える。
	 * {@link builtinProviders} に重ねられます。
	 *
	 * ```ts
	 * ai({
	 *   model: "groq:llama-3.3-70b-versatile",
	 *   providerLoaders: {
	 *     groq: {
	 *       package: "@ai-sdk/groq",
	 *       factory: "createGroq",
	 *       apiKeyEnv: "GROQ_API_KEY",
	 *       requiresEndpoint: false,
	 *     },
	 *   },
	 * })
	 * ```
	 * @default {@link builtinProviders} のみ
	 */
	providerLoaders?: Readonly<Record<string, AiProviderLoader>>;
	/**
	 * 既定のシステム指示。呼び出しごとの `instructions` が優先されます。
	 * @default null
	 */
	instructions?: string | null;
	/** @default null(プロバイダーの既定) */
	temperature?: number | null;
	/** @default null(プロバイダーの既定) */
	maxOutputTokens?: number | null;
	/**
	 * ツール呼び出しを含めて何ステップまで回すか
	 * (`stopWhen: stepCountIs(maxSteps)` になります)。
	 * @default 5
	 */
	maxSteps?: number;
	/**
	 * 1回の生成を打ち切るまでの時間。`false` で無制限。
	 * Discord のインタラクションは defer 後 15分まで応答できます。
	 * @default "120s"
	 */
	timeout?: DurationInput | false;
	/** ツール(`ai/`)の扱い。指定した項目だけが既定値を上書きします。 */
	tools?: AiToolsOptions;
	/** 会話履歴の扱い。指定した項目だけが既定値を上書きします。 */
	memory?: AiMemoryOptions;
	/** ストリーミング表示。指定した項目だけが既定値を上書きします。 */
	stream?: Partial<AiStreamConfig>;
	/** 数量の上限。指定した項目だけが既定値を上書きします。 */
	limits?: AiLimitsOptions;
	/** 応答の見せ方。指定した項目だけが既定値を上書きします。 */
	display?: AiDisplayOptions;
	/**
	 * ユーザーに見える文言。指定した項目だけが既定値を上書きします。
	 * @default {@link defaultAiTexts}
	 */
	texts?: AiTextsOptions;
}

const DEFAULT_STREAM: AiStreamConfig = {
	enabled: true,
	intervalMs: 1_200,
	cursor: "▌",
};

/** 期間指定(ミリ秒 / `"30s"` / `false`)を解決します。 */
function duration(
	value: DurationInput | false | undefined,
	fallback: DurationInput | false,
): number | false {
	const resolved = value ?? fallback;
	return resolved === false ? false : parseDuration(resolved);
}

/** 部分指定を既定値へ重ねて、完全な設定にします。 */
export function resolveAiConfig(options: AiConfigOptions = {}): AiConfig {
	// 分割の既定値は表示方法によって変わるので、embeds を先に決める。
	const embeds = options.display?.embeds ?? true;

	return {
		model: options.model ?? null,
		registry: options.registry ?? null,
		providers: { ...options.providers },
		providerLoaders: { ...builtinProviders, ...options.providerLoaders },
		instructions: options.instructions ?? null,
		temperature: options.temperature ?? null,
		maxOutputTokens: options.maxOutputTokens ?? null,
		maxSteps: options.maxSteps ?? 5,
		timeout: duration(options.timeout, "120s"),
		tools: {
			enabled: options.tools?.enabled ?? true,
			timeout: duration(options.tools?.timeout, "30s"),
		},
		memory: {
			enabled: options.memory?.enabled ?? true,
			maxMessages: options.memory?.maxMessages ?? 20,
			ttl: duration(options.memory?.ttl, "1h"),
			store: options.memory?.store,
		},
		stream: { ...DEFAULT_STREAM, ...options.stream },
		limits: {
			maxPromptLength: options.limits?.maxPromptLength ?? 4_000,
			maxResponseLength: options.limits?.maxResponseLength ?? false,
			cooldown: duration(options.limits?.cooldown, false),
		},
		display: {
			embeds,
			ephemeral: options.display?.ephemeral ?? false,
			splitThreshold: options.display?.splitThreshold ?? "auto",
			// 既定は安全側 — モデルの出力をそのまま本文へ流すため。
			allowedMentions:
				options.display?.allowedMentions === undefined
					? { parse: [] }
					: options.display.allowedMentions,
			decorate: options.display?.decorate,
			payload: options.display?.payload,
		},
		texts: resolveAiTexts(options.texts),
	};
}

/**
 * その呼び出しで実際に使う分割位置を返します。
 *
 * `display.splitThreshold` が数値ならそれを、`"auto"`(既定)なら
 * **その呼び出しで実際に使う表示方法**(埋め込みなら 4096、プレーン
 * テキストなら 2000)から算出します。`reply(interaction, { embeds: false })`
 * のように呼び出しごとに表示方法を変えても、分割位置がずれません。
 *
 * 明示した値でも、表示方法の上限(埋め込みなら 4096、プレーンテキスト
 * なら 2000)を超えた分は上限に丸めます — 超えた指定は discord.js が
 * 送信時に必ず拒否するので、様式の選択ではなく **回答が丸ごと失われる**
 * だけだからです。
 */
export function aiSplitThreshold(display: AiDisplayConfig, embeds: boolean): number {
	const limit = embeds ? EMBED_DESCRIPTION_LIMIT : MESSAGE_LIMIT;
	if (typeof display.splitThreshold === "number") {
		return Math.min(display.splitThreshold, limit);
	}
	return limit;
}

/** 何も指定しないときの設定。 */
export const defaultAiConfig: AiConfig = resolveAiConfig();

/**
 * そのクライアントに設定された ai の設定を取り出します。`ai()` を
 * 入れていない場合や、クライアント以外から呼ばれた場合は既定値です。
 *
 * これがあるおかげで、インタラクションしか受け取らないヘルパーでも
 * 「どのクライアントの呼び出しか」を自分で判断でき、利用者が毎回
 * 設定を渡す必要がありません。
 */
export function aiConfigOf(source: { client?: unknown } | null | undefined): AiConfig {
	const container = (source?.client as { container?: { aiConfig?: AiConfig } } | undefined)
		?.container;
	return container?.aiConfig ?? defaultAiConfig;
}

declare module "@cc-discord-framework/core" {
	interface Container {
		/** ai プラグインの設定。install 時に設定されます。 */
		aiConfig: AiConfig;
	}
}
