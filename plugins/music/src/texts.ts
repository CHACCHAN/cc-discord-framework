/**
 * **エンジンが投げるエラーの文言**のカタログ。
 *
 * このプラグインはコマンドを持たないため、ここにあるのは
 * 「再生エンジンが失敗したときにエラーへ載せる文言」だけです。
 * コマンドの応答文言や見せ方は Bot 側(`client/`)が自分のコードで決めます。
 *
 * ここにある文言は **すべて差し替えられます**。ハードコードされていて
 * 変えられない文言は存在しません。
 *
 * ```ts
 * music({ texts: { nothingPlaying: "いま何も鳴っていません。" } })
 * ```
 */

export interface MusicTexts {
	/** クエリに一致する音源が見つからなかった。 */
	noResult: (query: string) => string;
	/** トラックを再生できる StreamProvider がなかった(引数はトラックのタイトル)。 */
	noProvider: (title: string) => string;
	/**
	 * 何も再生していない状態で再生操作が行われた。
	 * {@link NotPlayingError} を投げるときの既定文言として使えます。
	 */
	nothingPlaying: string;
	/** 許可ディレクトリ外のローカルファイルを要求された。 */
	accessDenied: string;
	/** 音源の取得が HTTP エラーで失敗した。 */
	httpFailed: (status: number, title: string) => string;
	/** HTTP 音源の接続先が安全な公開アドレスではなかった。 */
	privateAddressDenied: (host: string) => string;
	/** HTTP 音源が制限時間内に応答しなかった。 */
	httpTimedOut: (title: string) => string;
	/** HTTP 音源のリダイレクト回数が設定上限を超えた。 */
	tooManyRedirects: (title: string) => string;
	/** 既存の音楽キューとは異なるボイスチャンネルから再生を要求した。 */
	voiceChannelMismatch: string;
	/** 取得した内容が音声ではなかった。 */
	notAudio: (contentType: string) => string;
	/** 応答本文が空でストリームを開けなかった。 */
	streamFailed: (title: string) => string;
}

/**
 * 何も指定しないときの文言。丸ごと差し替えるより、必要な項目だけを
 * `music({ texts: { nothingPlaying: "..." } })` のように上書きするほうが
 * 安全です。
 */
export const defaultMusicTexts: MusicTexts = {
	noResult: (query) => `「${query}」に一致する再生可能な音源が見つかりませんでした。`,
	noProvider: (title) =>
		`「${title}」を再生できるプロバイダーがありません。対応する StreamProvider を providers/ に追加してください。`,
	nothingPlaying: "現在このサーバーでは何も再生していません。",
	accessDenied: "このファイルへのアクセスは許可されていません。",
	httpFailed: (status, title) => `音源を取得できませんでした(HTTP ${status}): ${title}`,
	privateAddressDenied: (host) =>
		`安全でないネットワークアドレスへの接続は許可されていません: ${host}`,
	httpTimedOut: (title) => `音源サーバーから時間内に応答がありませんでした: ${title}`,
	tooManyRedirects: (title) => `音源URLのリダイレクト回数が上限を超えました: ${title}`,
	voiceChannelMismatch: "Botと同じボイスチャンネルへ参加してから操作してください。",
	notAudio: (contentType) =>
		`このURLは音声ファイルではありません(${contentType})。対応する Resolver / StreamProvider を追加してください。`,
	streamFailed: (title) => `音源のストリームを開けませんでした: ${title}`,
};

/** {@link MusicTexts} の部分指定。指定しなかった項目は既定値のままです。 */
export type MusicTextsOptions = Partial<MusicTexts>;

/** 部分指定を既定値へ重ねて、完全な文言カタログにします。 */
export function resolveMusicTexts(options: MusicTextsOptions = {}): MusicTexts {
	return { ...defaultMusicTexts, ...options };
}
