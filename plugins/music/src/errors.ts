import { UserError } from "@cc-discord-framework/core";

/**
 * 音楽再生に関する、ユーザーへ提示してよいエラー。
 *
 * {@link UserError} を継承しているため、コマンドから throw すると
 * フレームワークの既定処理がそのままメッセージを返信します。
 *
 * どのエラーも **文言は投げる側が渡します**。文言は `texts` に集約されて
 * いるので、`musicConfigOf(interaction).texts` などから解決したものを
 * 渡してください(既定値もそこにあります)。
 */
export class MusicError extends UserError {
	public constructor(
		message: string,
		options?: ErrorOptions & { identifier?: string; context?: unknown },
	) {
		super(message, { identifier: "MusicError", ...options });
	}
}

/** クエリを解釈できる Resolver がなかった、または結果が空だった。 */
export class NoResultError extends MusicError {
	public constructor(message: string, query: string) {
		super(message, { identifier: "NoResult", context: { query } });
	}
}

/** トラックを再生できる StreamProvider がなかった。 */
export class NoProviderError extends MusicError {
	public constructor(message: string, title: string) {
		super(message, { identifier: "NoProvider", context: { title } });
	}
}

/** ボイスチャンネルに接続していない状態で再生操作が行われた。 */
export class NotPlayingError extends MusicError {
	public constructor(message: string) {
		super(message, { identifier: "NotPlaying" });
	}
}
