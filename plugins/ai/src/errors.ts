import { APICallError, NoOutputGeneratedError } from "ai";
import { UserError } from "cc-discord-framework";
import type { AiTexts } from "./texts.js";

/**
 * AI 機能に関する、ユーザーへ提示してよいエラー。
 *
 * {@link UserError} を継承しているため、コマンドから throw すると
 * フレームワークの既定処理がそのままメッセージを返信します。
 *
 * どのエラーも **文言は投げる側が渡します**。文言は `texts` に集約されて
 * いるので、`aiConfigOf(interaction).texts` などから解決したものを
 * 渡してください(既定値もそこにあります)。
 */
export class AiError extends UserError {
	public constructor(
		message: string,
		options?: ErrorOptions & { identifier?: string; context?: unknown },
	) {
		super(message, { identifier: "AiError", ...options });
	}
}

/** 使うモデルが決まっていない(`ai({ model })` も呼び出し時の指定も無い)。 */
export class ModelNotConfiguredError extends AiError {
	public constructor(message: string) {
		super(message, { identifier: "ModelNotConfigured" });
	}
}

/**
 * 文字列で指定されたプロバイダーのパッケージが入っていない。
 *
 * プロバイダーは optional peer dependency なので、使うものだけを
 * `bun add` してください。`packageName` に入れるべきパッケージ名が入ります。
 */
export class ProviderNotInstalledError extends AiError {
	/** インストールが必要なパッケージ名。 */
	public readonly packageName: string;

	public constructor(message: string, provider: string, packageName: string, cause?: unknown) {
		super(message, {
			identifier: "ProviderNotInstalled",
			context: { provider, packageName },
			cause,
		});
		this.packageName = packageName;
	}
}

/** モデル指定を解釈できなかった(未知のプロバイダー・書式違い・設定不足)。 */
export class ModelResolutionError extends AiError {
	public constructor(message: string, context?: unknown) {
		super(message, { identifier: "ModelResolution", context });
	}
}

/** API キーが見つからなかった。 */
export class ApiKeyMissingError extends AiError {
	public constructor(message: string, provider: string, variable: string) {
		super(message, { identifier: "ApiKeyMissing", context: { provider, variable } });
	}
}

/** 生成またはツール実行が制限時間を超えた。 */
export class AiTimeoutError extends AiError {
	public constructor(message: string, timeoutMs: number) {
		super(message, { identifier: "AiTimeout", context: { timeoutMs } });
	}
}

/** 入力が `limits.maxPromptLength` を超えていた。 */
export class PromptTooLongError extends AiError {
	public constructor(message: string, length: number, max: number) {
		super(message, { identifier: "PromptTooLong", context: { length, max } });
	}
}

/** `limits.cooldown` の待ち時間が明けていない。 */
export class CooldownError extends AiError {
	public constructor(message: string, remainingMs: number) {
		super(message, { identifier: "Cooldown", context: { remainingMs } });
	}
}

/** 例外・非例外を問わず、人間が読めるメッセージを取り出します。 */
export function messageOf(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

/**
 * 人間が読めるメッセージ。HTTP エラーならステータスコードも添えます
 * ({@link AiTexts.apiCallFailed} を通すので、言い換えは差し替えられます)。
 */
export function describeError(error: unknown, texts: Pick<AiTexts, "apiCallFailed">): string {
	const message = messageOf(error);
	if (!APICallError.isInstance(error) || error.statusCode === undefined) return message;
	return texts.apiCallFailed(error.statusCode, message);
}

/**
 * ストリーミングで消えた原因を取り戻します。
 *
 * AI SDK v7 は **失敗を `textStream` へ流しません**(`onError` と
 * `fullStream` の error パートにだけ流します)。1断片も出ないまま失敗すると
 * `result.usage` などが `NoOutputGeneratedError` で reject しますが、
 * これは **cause を持たない** ため「stream を見ろ」としか言えません
 * (実際に「401 Unauthorized」が「No output generated.」に化けていました)。
 *
 * `onError` で捕まえておいた本当のエラーがあれば、そちらを返します。
 * タイムアウトなど別の理由で失敗した場合は元のエラーをそのまま返します。
 */
export function streamFailure(error: unknown, captured: unknown): unknown {
	if (captured === undefined || captured === null) return error;
	if (!NoOutputGeneratedError.isInstance(error)) return error;
	// 既に cause が入っているならそちらが本当の原因なので触らない。
	if (error.cause !== undefined) return error;
	return captured;
}
