/**
 * 音源プラグインの設定。クライアント毎にコンテナへ置かれるため、
 * 複数クライアントを立てても混ざりません。
 *
 * すべての項目に既定値があり、すべて上書きできます。
 */

/** 素のテキスト(URL でない入力)を検索に回す担当。 */
export type SearchProvider = "youtube" | "soundcloud" | "none";

/** 曲名・長さ・サムネイルをどこから取るか。 */
export type MetadataSource = "innertube" | "yt-dlp";

export interface YtdlpConfig {
	/** 実行ファイル。PATH 上にあれば名前だけで構いません。 @default "yt-dlp" */
	path: string;
	/**
	 * `-f` に渡すフォーマット指定。既定は opus を最優先にしており、
	 * 取得できれば **変換なし**(ffmpeg 不要)で再生できます。
	 * @default "bestaudio[acodec=opus]/bestaudio"
	 */
	format: string;
	/** 毎回付ける引数。 @default ["--no-warnings", "--no-progress"] */
	commonArgs: readonly string[];
	/**
	 * yt-dlp の完了をこのミリ秒まで待ちます。超えるとプロセスを kill して
	 * エラーにします(ハングした yt-dlp がギルドのキューを塞ぎ続けない
	 * ための保険)。`false` で打ち切らずに待ち続けます。
	 * @default 30000
	 */
	timeout: number | false;
}

export interface FfmpegConfig {
	/** 実行ファイル。 @default "ffmpeg" */
	path: string;
	/**
	 * 入力 URL から引数列を組み立てます。丸ごと差し替えられます。
	 * 標準出力へ 48kHz ステレオの s16le PCM を吐くこと。
	 */
	args: (input: string) => string[];
}

export interface YouTubeConfig {
	enabled: boolean;
	/** Resolver の優先度。大きいほど先に試されます。 @default 20 */
	priority: number;
	/**
	 * メタデータの取得元。`"innertube"` は youtubei.js を使い高速ですが、
	 * YouTube 側の変更で壊れることがあります。その場合は自動的に yt-dlp へ
	 * 切り替わります(`"yt-dlp"` を指定すると最初から yt-dlp を使います)。
	 * @default "innertube"
	 */
	metadata: MetadataSource;
	/**
	 * 検索で取得する候補数(採用するのは先頭1件)。少ないほど速くなります。
	 *
	 * **yt-dlp 経路(`metadata: "yt-dlp"` とフォールバック時)でのみ効きます。**
	 * InnerTube の検索 API は件数を指定できないため、`metadata: "innertube"`
	 * のときは YouTube が返す件数のままです。
	 * @default 5
	 */
	searchLimit: number;
	/** プレイリストから取り込む最大曲数。 @default 100 */
	playlistLimit: number;
	/** yt-dlp に渡す cookies ファイル。年齢制限付き動画などに。 */
	cookies: string | null;
	/** 音源の取得時に送る User-Agent。 @default "cc-discord-framework-music-sources" */
	userAgent: string;
	/** 再生 URL の取得に使う yt-dlp の設定。 */
	ytdlp: YtdlpConfig;
}

export interface SoundCloudConfig {
	enabled: boolean;
	/** Resolver の優先度。 @default 20 */
	priority: number;
	/** 検索で候補を何件取得するか。 @default 5 */
	searchLimit: number;
	/** プレイリストから取り込む最大曲数。 @default 100 */
	playlistLimit: number;
	/**
	 * client_id。未指定なら soundcloud.ts が公開バンドルから自動抽出します
	 * (数か月で失効することがあるため、安定させたい場合は指定してください)。
	 */
	clientId: string | null;
	/** Go+ 音質などに必要な OAuth トークン。 */
	oauthToken: string | null;
	/**
	 * サムネイルのサイズ。SoundCloud の既定は小さい `-large` なので、
	 * ここで指定したサイズへ差し替えます。`null` で差し替えない。
	 * @default "t500x500"
	 */
	artworkSize: string | null;
}

export interface MusicSourcesConfig {
	youtube: YouTubeConfig;
	soundcloud: SoundCloudConfig;
	search: SearchProvider;
	ffmpeg: FfmpegConfig;
}

/** サムネイルの既定サイズ。SoundCloud の `-large` は小さすぎるため。 */
export const DEFAULT_ARTWORK_SIZE = "t500x500";

/** 既定の ffmpeg 引数。HTTP/HLS のどちらも扱えます。 */
export function defaultFfmpegArgs(input: string): string[] {
	return [
		"-hide_banner",
		"-loglevel",
		"error",
		// 途切れたら張り直す(ラジオや長い曲で効く)。-i より前に置く必要がある。
		"-reconnect",
		"1",
		"-reconnect_streamed",
		"1",
		"-reconnect_delay_max",
		"5",
		"-i",
		input,
		"-vn",
		"-f",
		"s16le",
		"-ar",
		"48000",
		"-ac",
		"2",
		"pipe:1",
	];
}

declare module "cc-discord-framework" {
	interface Container {
		/** `musicSources()` が解決して置く設定。 */
		musicSourcesConfig: MusicSourcesConfig;
	}
}
