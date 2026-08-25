import type { LanguageModelUsage } from "ai";
import type { Client, Logger } from "cc-discord-framework";
import type { AiTool, AiToolContext } from "./AiTool.js";

/** 生成を始めるときに分かっていること。 */
export interface AiRequestInfo {
	/** ユーザーの入力。 */
	readonly prompt: string;
	/** 呼び出し元のチャンネル。判らなければ `null`。 */
	readonly channelId: string | null;
	/** 呼び出したユーザー。判らなければ `null`。 */
	readonly userId: string | null;
	/** 呼び出し元のサーバー。DM や判らない場合は `null`。 */
	readonly guildId: string | null;
	/** 途中経過を編集で見せるか。 */
	readonly streaming: boolean;
	/** モデルへ渡したツールの名前。 */
	readonly toolNames: readonly string[];
}

/** 生成が終わったときに分かっていること。 */
export interface AiResponseInfo {
	/** 生成された本文。 */
	readonly text: string;
	/** トークン数。判らなければ `null`。 */
	readonly usage: LanguageModelUsage | null;
	/** 生成が終わった理由。判らなければ `null`。 */
	readonly finishReason: string | null;
	/** 実際に呼ばれたツールの名前(重複なし・呼ばれた順)。 */
	readonly toolNames: readonly string[];
}

/**
 * どこで失敗したか。
 *
 * ここに並ぶのは **実際に発火する値だけ** です — 生成そのもの
 * (`"generate"`・ストリーミングも含みます)、ツールの実行(`"tool"`)、
 * Discord への表示(`"display"`)、会話履歴の読み書き(`"memory"`)。
 * モデルの解決に失敗した場合は握りつぶさず throw するので、`aiError` には
 * 流れません。
 */
export type AiErrorPhase = "generate" | "tool" | "display" | "memory";

/** エラーの発生場所。 */
export interface AiErrorInfo {
	/** どの処理で失敗したか。 */
	readonly phase: AiErrorPhase;
	/** 呼び出し元のチャンネル。判らなければ `null`。 */
	readonly channelId: string | null;
	/** 呼び出したユーザー。判らなければ `null`。 */
	readonly userId: string | null;
	/** 呼び出し元のサーバー。判らなければ `null`。 */
	readonly guildId: string | null;
	/** `phase: "tool"` のときのツール名。それ以外は `null`。 */
	readonly tool: string | null;
}

/**
 * ai プラグインがクライアント上で発火するイベント。
 * 通常の discord.js エミッターに乗るため、`Listener` コンポーネントで
 * 型付きのまま観測できます。
 *
 * ```ts
 * @Listener.define({ event: "aiResponse" })
 * export class UsageListener extends Listener<"aiResponse"> {
 *   override run(response: AiResponseInfo) {
 *     this.logger.info({ tokens: response.usage?.totalTokens }, "AI が応答しました");
 *   }
 * }
 * ```
 */
export const AiEvents = {
	/** 生成の開始: `(request)` */
	Request: "aiRequest",
	/** 生成の完了: `(response, request)` */
	Response: "aiResponse",
	/** ツールの呼び出し: `(tool, input, context)` */
	ToolCall: "aiToolCall",
	/** 内部で処理したエラー: `(error, info)` */
	Error: "aiError",
} as const;

export type AiEvent = (typeof AiEvents)[keyof typeof AiEvents];

/**
 * 内部で処理したエラーを知らせます。
 *
 * `aiError` を購読しているリスナーが1つでもいれば、そこへ渡すだけで
 * 終わりです。**誰も購読していなければ**、既定動作としてログへ残します
 * (フレームワークの `commandError` と同じ形)。
 *
 * ここを通るのは「握りつぶさずに続行した」エラー — ツールの失敗、
 * ストリーミング編集の失敗、履歴の読み書きの失敗 — だけです。
 * 呼び出し元へ返すべきエラーはそのまま throw されます。
 */
export function reportAiError(
	client: Client,
	logger: Logger,
	error: unknown,
	info: AiErrorInfo,
): void {
	const handled = client.emit(AiEvents.Error, error, info);
	if (handled) return;
	logger.error({ err: error, ...info }, "AI の処理でエラーが発生しました");
}

declare module "discord.js" {
	interface ClientEvents {
		aiRequest: [request: AiRequestInfo];
		aiResponse: [response: AiResponseInfo, request: AiRequestInfo];
		aiToolCall: [tool: AiTool, input: unknown, context: AiToolContext];
		aiError: [error: unknown, info: AiErrorInfo];
	}
}
