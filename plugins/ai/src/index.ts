/**
 * 公式 ai プラグイン — Vercel AI SDK を使った、複数プロバイダー対応の AI 機能。
 *
 * ```ts
 * import { ai } from "@cc-discord-framework/ai";
 *
 * const client = new Client({
 *   intents: [GatewayIntentBits.Guilds],
 *   plugins: [ai({ model: "google:gemini-2.5-flash" })],
 * });
 * ```
 *
 * # コマンドは登録しません
 *
 * このプラグインが提供するのは `ai/` の自動ロードと
 * {@link AiService}(`this.services.ai`)、そしてイベントだけです。
 * **`/ask` のようなスラッシュコマンドは Bot の機能なので、Bot 側で
 * 明示的に書いてください。** {@link AiService.reply} が defer・
 * ストリーミング表示・分割まで引き受けるので、数行で書けます。
 *
 * ```ts
 * // client/src/commands/AskCommand.ts
 * @Command.define({ description: "AI に質問します。", options: [...] })
 * export class AskCommand extends Command {
 *   override async chatInputRun(interaction: ChatInputCommandInteraction) {
 *     await this.services.ai.reply(interaction, {
 *       prompt: interaction.options.getString("prompt", true),
 *     });
 *   }
 * }
 * ```
 *
 * # 設計: ツールは「置くだけ」
 *
 * `ai/` に {@link AiTool} を置くと、そのままモデルから呼べる関数になります。
 * 中では他のコンポーネントと同じく `this.services.*` / `this.container` /
 * `this.logger` が使えるので、Bot が既に持っている機能をそのまま AI へ
 * 開放できます。**これがこのプラグインの核心**です。
 *
 * # プロバイダーは使うものだけ入れる
 *
 * `@ai-sdk/*` は optional peer dependency です。文字列で名指しされた
 * ときにだけ動的 import するので、入っていないプロバイダーがあっても
 * 起動は落ちません。同梱リゾルバが解決できるのは
 * `openai` / `anthropic` / `google` / `compatible` の4つです。
 *
 * `compatible`(`@ai-sdk/openai-compatible`)は OpenAI 互換 API への
 * 接続口で、Ollama / LM Studio / vLLM / llama.cpp / OpenRouter はここから
 * 使えます(Ollama 専用の公式プロバイダーはありません)。
 *
 * ```ts
 * ai({
 *   model: "compatible:llama3.2",
 *   providers: { compatible: { name: "ollama", baseURL: "http://localhost:11434/v1" } },
 * })
 * ```
 *
 * それ以外は `ai({ registry })` に `createProviderRegistry()` の戻り値を
 * 渡してください。
 *
 * # 既定のモデルはありません
 *
 * 勝手に課金される先を既定にしないため、`model` に既定値は置いていません。
 * 無料枠のあるモデル(Google Gemini など)から試すのがおすすめです。
 *
 * # 文言・記号・間隔・上限はすべて差し替えられます
 *
 * ユーザーに見える文言は {@link AiTexts} に、数値やふるまいは
 * {@link AiConfig} の `limits` / `stream` / `memory` / `tools` / `display`
 * に集約されています。**応答本文の組み立て({@link AiTexts.answerBody})
 * ごと差し替えられる**ので、並び順や区切りまで利用者が決められます。
 * ハードコードされて変えられない値はありません。
 */
import { definePlugin, type Plugin } from "cc-discord-framework";
import { AiService } from "./AiService.js";
import { AiToolStore } from "./AiTool.js";
import { resolveAiConfig, type AiConfigOptions } from "./config.js";

/** `ai()` に渡すオプション({@link AiConfig} の部分指定)。 */
export type AiOptions = AiConfigOptions;

/**
 * ai プラグインをインストールします。
 *
 * `ai/` というコンポーネント種別を追加し、`this.services.ai` を提供します。
 * **コマンドは登録しません** — Bot の機能は Bot 側で書いてください。
 */
export function ai(options: AiOptions = {}): Plugin {
	return definePlugin({
		name: "ai",
		install(client) {
			// コンテナ経由で配ることで、複数クライアントでも設定が混ざらない。
			client.container.aiConfig = resolveAiConfig(options);

			client.stores.register(new AiToolStore());
			client.register(AiService);
		},
	});
}

// ---- 公開 API ----------------------------------------------------------

export {
	AiService,
	type AiCallOptions,
	type AiGenerateOptions,
	type AiGenerateResult,
	type AiReplyOptions,
	type AiReplyResult,
	type AiReplyTarget,
	type AiStreamResult,
} from "./AiService.js";
export {
	aiConfigOf,
	aiSplitThreshold,
	defaultAiConfig,
	resolveAiConfig,
	type AiConfig,
	type AiConfigOptions,
	type AiDisplayConfig,
	type AiDisplayOptions,
	type AiLimits,
	type AiLimitsOptions,
	type AiMemoryConfig,
	type AiMemoryOptions,
	type AiStreamConfig,
	type AiToolsConfig,
	type AiToolsOptions,
} from "./config.js";
export {
	defaultAiTexts,
	resolveAiTexts,
	type AiAnswerParts,
	type AiReplyKind,
	type AiSource,
	type AiTexts,
	type AiTextsOptions,
} from "./texts.js";
export {
	builtinProviders,
	ModelResolver,
	type AiModelInput,
	type AiProviderLoader,
	type AiProviderName,
	type AiProviders,
	type AiProviderSettings,
	type AiRegistry,
	type ModelResolverOptions,
} from "./models.js";
export {
	MapMemoryStore,
	type AiMemoryStore,
	type MapMemoryStoreOptions,
} from "./memory.js";
export {
	AiTool,
	AiToolStore,
	type AiToolContext,
	type AiToolOptions,
} from "./AiTool.js";
export {
	AiError,
	ApiKeyMissingError,
	AiTimeoutError,
	CooldownError,
	messageOf,
	ModelNotConfiguredError,
	ModelResolutionError,
	PromptTooLongError,
	ProviderNotInstalledError,
} from "./errors.js";
export {
	AiEvents,
	reportAiError,
	type AiErrorInfo,
	type AiErrorPhase,
	type AiEvent,
	type AiRequestInfo,
	type AiResponseInfo,
} from "./events.js";
export {
	renderAiPayload,
	type AiMessagePayload,
	type AiPayloadContext,
	type RenderOptions,
} from "./render.js";

declare module "cc-discord-framework" {
	interface Stores {
		ai: AiToolStore;
	}
}
