/**
 * 公式 music-sources プラグイン — YouTube と SoundCloud を音源として追加します。
 *
 * ```ts
 * import { music } from "@cc-discord-framework/music";
 * import { musicSources } from "@cc-discord-framework/music-sources";
 *
 * const client = new Client({
 *   intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
 *   plugins: [music(), musicSources()],
 * });
 * ```
 *
 * # 別パッケージにしている理由
 *
 * `@cc-discord-framework/music` は「壊れない音源」(直リンク・ラジオ・
 * Internet Archive・ローカル)だけを同梱しています。YouTube や SoundCloud は
 * 各サービスの都合で **定期的に壊れる層** なので、独立したパッケージに
 * 分けてあります。壊れたときはこのパッケージ(と yt-dlp)だけを更新すれば
 * よく、キューや再生制御の資産には影響しません。
 *
 * # 必要なもの
 *
 * | 音源 | 外部依存 |
 * | --- | --- |
 * | YouTube | **yt-dlp**(PATH 上)。opus をそのまま渡すので ffmpeg は不要 |
 * | SoundCloud | **ffmpeg**(HLS/AAC のため必須) |
 *
 * # 利用にあたって
 *
 * どちらのサービスも、公式 API ではない経路でアクセスします。各サービスの
 * 利用規約を確認したうえで、自分の責任で使ってください。
 */
import { definePlugin, type Plugin } from "cc-discord-framework";
import {
	DEFAULT_ARTWORK_SIZE,
	defaultFfmpegArgs,
	type MetadataSource,
	type MusicSourcesConfig,
	type SearchProvider,
	type SoundCloudConfig,
	type YouTubeConfig,
	type YtdlpConfig,
} from "./config.js";
import { SoundCloudResolver } from "./soundcloud/SoundCloudResolver.js";
import { SoundCloudStreamProvider } from "./soundcloud/SoundCloudStreamProvider.js";
import { YouTubeResolver } from "./youtube/YouTubeResolver.js";
import { YouTubeStreamProvider } from "./youtube/YouTubeStreamProvider.js";

/** 部分指定。指定しなかった項目は既定値のままになります。 */
export interface MusicSourcesOptions {
	/** YouTube。`false` で無効化。 */
	youtube?: boolean | Partial<Omit<YouTubeConfig, "ytdlp">> & { ytdlp?: Partial<YtdlpConfig> };
	/** SoundCloud。`false` で無効化。 */
	soundcloud?: boolean | Partial<SoundCloudConfig>;
	/**
	 * URL でない入力(素の検索語)を誰が拾うか。
	 * @default "youtube"
	 */
	search?: SearchProvider;
	/** 変換が必要な音源で使う ffmpeg。 */
	ffmpeg?: Partial<MusicSourcesConfig["ffmpeg"]>;
}

const DEFAULT_YTDLP: YtdlpConfig = {
	path: "yt-dlp",
	// opus が取れれば変換不要で再生できる。
	format: "bestaudio[acodec=opus]/bestaudio",
	commonArgs: ["--no-warnings", "--no-progress"],
	// ハングした yt-dlp を打ち切るまでのミリ秒。
	timeout: 30_000,
};

const DEFAULT_YOUTUBE: YouTubeConfig = {
	enabled: true,
	priority: 20,
	metadata: "innertube",
	searchLimit: 5,
	playlistLimit: 100,
	cookies: null,
	userAgent: "cc-discord-framework-music-sources",
	ytdlp: DEFAULT_YTDLP,
};

const DEFAULT_SOUNDCLOUD: SoundCloudConfig = {
	enabled: true,
	priority: 20,
	searchLimit: 5,
	playlistLimit: 100,
	clientId: null,
	oauthToken: null,
	artworkSize: DEFAULT_ARTWORK_SIZE,
};

function resolveYouTube(options: MusicSourcesOptions["youtube"]): YouTubeConfig {
	if (options === false) return { ...DEFAULT_YOUTUBE, enabled: false };
	if (options === true || options === undefined) return DEFAULT_YOUTUBE;
	return {
		...DEFAULT_YOUTUBE,
		...options,
		ytdlp: { ...DEFAULT_YTDLP, ...options.ytdlp },
	};
}

function resolveSoundCloud(options: MusicSourcesOptions["soundcloud"]): SoundCloudConfig {
	if (options === false) return { ...DEFAULT_SOUNDCLOUD, enabled: false };
	if (options === true || options === undefined) return DEFAULT_SOUNDCLOUD;
	return { ...DEFAULT_SOUNDCLOUD, ...options };
}

/**
 * 音源プラグインをインストールします。
 *
 * `music()` が追加した `resolvers/` と `providers/` の種別へ、
 * YouTube と SoundCloud のコンポーネントを登録します。`music()` より
 * **後に** 並べてください。
 */
export function musicSources(options: MusicSourcesOptions = {}): Plugin {
	return definePlugin({
		name: "music-sources",
		install(client) {
			const config: MusicSourcesConfig = {
				youtube: resolveYouTube(options.youtube),
				soundcloud: resolveSoundCloud(options.soundcloud),
				search: options.search ?? "youtube",
				ffmpeg: {
					path: options.ffmpeg?.path ?? "ffmpeg",
					args: options.ffmpeg?.args ?? defaultFfmpegArgs,
				},
			};
			// コンテナ経由で配ることで、複数クライアントでも設定が混ざらない。
			client.container.musicSourcesConfig = config;

			if (config.youtube.enabled) {
				client.register(YouTubeResolver, YouTubeStreamProvider);
				if (!Bun.which(config.youtube.ytdlp.path)) {
					client.logger.warn(
						{ plugin: "music-sources", path: config.youtube.ytdlp.path },
						"yt-dlp が見つかりません。YouTube の再生にはインストールが必要です",
					);
				}
			}
			if (config.soundcloud.enabled) {
				client.register(SoundCloudResolver, SoundCloudStreamProvider);
				if (!Bun.which(config.ffmpeg.path)) {
					client.logger.warn(
						{ plugin: "music-sources", path: config.ffmpeg.path },
						"ffmpeg が見つかりません。SoundCloud の再生にはインストールが必要です",
					);
				}
			}
			if (config.search !== "none" && !config[config.search].enabled) {
				client.logger.warn(
					{ plugin: "music-sources", search: config.search },
					"検索担当に指定された音源が無効になっています。検索語からの再生はできません",
				);
			}
		},
	});
}

// ---- 公開 API ----------------------------------------------------------

export {
	DEFAULT_ARTWORK_SIZE,
	defaultFfmpegArgs,
	type FfmpegConfig,
	type MetadataSource,
	type MusicSourcesConfig,
	type SearchProvider,
	type SoundCloudConfig,
	type YouTubeConfig,
	type YtdlpConfig,
} from "./config.js";
export { ffmpegPcm, FfmpegMissingError } from "./ffmpeg.js";
export { SoundCloudResolver } from "./soundcloud/SoundCloudResolver.js";
export { SoundCloudStreamProvider } from "./soundcloud/SoundCloudStreamProvider.js";
export { YouTubeResolver } from "./youtube/YouTubeResolver.js";
export { YouTubeStreamProvider } from "./youtube/YouTubeStreamProvider.js";
export { isYouTubeUrl, parseYouTubeUrl, watchUrl, type YouTubeTarget } from "./youtube/url.js";
export { ytdlpAudioUrl, ytdlpJson, YtdlpError, YtdlpMissingError, type YtdlpInfo } from "./youtube/ytdlp.js";
