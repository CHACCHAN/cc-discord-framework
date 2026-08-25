import { StreamType } from "@discordjs/voice";

/**
 * 既定で音声ファイルとして扱う拡張子。
 * `music({ network: { audioExtensions } })` で差し替えられます。
 */
export const DEFAULT_AUDIO_EXTENSIONS: readonly string[] = [
	"mp3", "ogg", "opus", "oga", "flac", "wav", "m4a", "aac", "webm", "weba", "mp4", "mkv",
];

/**
 * パスや URL の拡張子から {@link StreamType} を推定します。
 *
 * opus をそのまま含むコンテナ(`.opus` / `.webm`)は変換せずに送れるため
 * ffmpeg も opus エンコードも不要になります。それ以外は `Arbitrary` を
 * 返し、ffmpeg での変換が必要になります。
 *
 * `.ogg` は Vorbis の可能性があるため、あえて `Arbitrary` にしています。
 */
export function guessStreamType(pathOrUrl: string, contentType?: string | null): StreamType {
	if (contentType) {
		const type = contentType.split(";")[0]?.trim().toLowerCase();
		if (type === "audio/opus") return StreamType.OggOpus;
		if (type === "audio/webm" || type === "video/webm") return StreamType.WebmOpus;
	}
	switch (extensionOf(pathOrUrl)) {
		case "opus":
			return StreamType.OggOpus;
		case "webm":
		case "weba":
			return StreamType.WebmOpus;
		default:
			return StreamType.Arbitrary;
	}
}

/**
 * 拡張子から音声ファイルらしいかを判定します。
 * 扱う拡張子は `network.audioExtensions` から渡せます。
 */
export function looksLikeAudio(
	pathOrUrl: string,
	extensions: readonly string[] = DEFAULT_AUDIO_EXTENSIONS,
): boolean {
	const ext = extensionOf(pathOrUrl);
	return ext !== null && extensions.includes(ext);
}

/** ffmpeg での変換が必要な形式か。 */
export function requiresFfmpeg(type: StreamType): boolean {
	return type === StreamType.Arbitrary;
}

/** パスや URL から拡張子(小文字・ドットなし)を取り出します。 */
export function extensionOf(pathOrUrl: string): string | null {
	const withoutQuery = pathOrUrl.split(/[?#]/)[0] ?? "";
	const file = withoutQuery.slice(withoutQuery.lastIndexOf("/") + 1);
	const dot = file.lastIndexOf(".");
	if (dot <= 0 || dot === file.length - 1) return null;
	return file.slice(dot + 1).toLowerCase();
}

/** パスや URL からタイトルらしい文字列を作ります。 */
export function titleFrom(pathOrUrl: string): string {
	const withoutQuery = pathOrUrl.split(/[?#]/)[0] ?? pathOrUrl;
	const file = decodeURIComponent(withoutQuery.slice(withoutQuery.lastIndexOf("/") + 1));
	if (!file) return pathOrUrl;
	const dot = file.lastIndexOf(".");
	return dot > 0 ? file.slice(0, dot) : file;
}
