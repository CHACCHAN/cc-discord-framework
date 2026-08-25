/**
 * フレームワーク自身が投げるすべてのエラーの基底クラス。
 *
 * `FrameworkError` を catch することで、Discord API のエラーや
 * アプリケーション自身のエラーとフレームワーク起因の失敗を区別できます。
 */
export class FrameworkError extends Error {
	public constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = new.target.name;
	}
}

/**
 * コンポーネントのロード・登録に失敗したときのエラー — 名前の重複、
 * 不正なメタデータ、存在しない Precondition 参照など。
 *
 * ロードエラーは {@link Client.load} 中に投げられるため、設定ミスのある
 * Bot は実行時に誤動作する前に、起動時点で確実に失敗します。
 */
export class ComponentLoadError extends FrameworkError {
	/** ロード元ファイルの絶対パス(あれば)。 */
	public readonly path: string | null;

	public constructor(message: string, options?: ErrorOptions & { path?: string | null }) {
		super(message, options);
		this.path = options?.path ?? null;
	}
}

/**
 * 設定ディレクトリの読み込みに失敗したときのエラー — ディレクトリや設定
 * ファイルが見つからない、default export がない、複数のファイルが同じ
 * キーに違う値を書いている、`intents` がどこにもない、など。
 *
 * 設定エラーは {@link createClient} / {@link loadClientConfig} の時点で
 * 投げられるため、設定の取りこぼしを抱えた Bot は Discord へ接続する前に
 * 確実に失敗します。
 */
export class ConfigLoadError extends FrameworkError {
	/** 問題のあった設定ファイル、または設定ディレクトリの絶対パス(あれば)。 */
	public readonly path: string | null;

	public constructor(message: string, options?: ErrorOptions & { path?: string | null }) {
		super(message, options);
		this.path = options?.path ?? null;
	}
}

/**
 * `message` が Discord 上のエンドユーザーに向けられたエラー。
 *
 * コマンド内から throw するとユーザー向けメッセージ付きで中断でき、
 * Precondition は {@link Precondition.deny} で生成します。デフォルトの
 * `commandError` / `commandDenied` 処理はスタックトレースを記録する
 * 代わりに `message` を返信します。
 */
export class UserError extends FrameworkError {
	/** 機械可読な識別子(Precondition 由来なら Precondition 名)。 */
	public readonly identifier: string;
	/** 投げた側が添付する任意の追加データ。 */
	public readonly context: unknown;

	public constructor(
		message: string,
		options?: ErrorOptions & { identifier?: string; context?: unknown },
	) {
		super(message, options);
		this.identifier = options?.identifier ?? "UserError";
		this.context = options?.context;
	}
}
