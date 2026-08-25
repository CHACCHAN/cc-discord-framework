/**
 * 公式 music プラグイン — キュー・再生制御・差し替え可能なプロバイダー。
 *
 * ```ts
 * import { music } from "@cc-discord-framework/music";
 *
 * const client = new Client({
 *   intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
 *   plugins: [music()],
 * });
 * ```
 *
 * # このプラグインはコマンドを登録しません
 *
 * プラグインが提供するのは **コンポーネント種別の自動ロード**
 * (`resolvers/` / `providers/`)、**サービス**(`this.services.audio`)、
 * **イベント**(`musicTrackStart` など)、そして **再生エンジンの設定** だけです。
 *
 * `/play` などの「Bot の機能」は Bot 側(`client/`)で
 * `this.services.audio` を使って書いてください。
 *
 * # 設計: Resolve と Stream の分離
 *
 * 「何を再生するか」({@link TrackResolver})と「どこから音を取るか」
 * ({@link StreamProvider})を別のコンポーネント種別に分けています。
 * 音源サイトの仕様変更で壊れるのは常に後者なので、分離しておくことで
 * Provider を差し替えるだけで復旧でき、Resolver 側の資産は失われません。
 *
 * # 同梱プロバイダー
 *
 * 既定では **スクレイピングを伴わない音源のみ** を同梱しています
 * (直リンク・Icecast ラジオ・Internet Archive・任意でローカルファイル)。
 * これらは各サイトの利用規約に抵触せず、かつ壊れることがありません。
 *
 * YouTube と SoundCloud は公式の
 * `@cc-discord-framework/music-sources` を並べるだけで追加できます。
 * 自前の音源を足す場合は `resolvers/` と `providers/` にコンポーネントを
 * 置いてください(追加方法は README を参照)。
 *
 * # エンジンの設定はすべて差し替えられます
 *
 * エンジンが投げるエラーの文言は {@link MusicTexts} に、数値の上限や接続の
 * 挙動は {@link MusicConfig} の `limits` / `voice` / `network` に集約されて
 * います。`music({ texts, limits, ... })` で必要な項目だけを上書きできます。
 * ハードコードされて変えられない値はありません。
 */
import { definePlugin, type Plugin } from "@cc-discord-framework/core";
import { AudioService } from "./AudioService.js";
import { resolveMusicConfig, type MusicConfigOptions } from "./config.js";
import { TrackResolverStore } from "./TrackResolver.js";
import { StreamProviderStore } from "./StreamProvider.js";
import { ArchiveResolver } from "./builtin/ArchiveResolver.js";
import { HttpStreamProvider } from "./builtin/HttpStreamProvider.js";
import { UrlResolver } from "./builtin/UrlResolver.js";
import { LocalFileResolver, LocalFileStreamProvider } from "./builtin/local.js";
import { VoiceStateListener } from "./builtin/VoiceStateListener.js";

/** `music()` に渡せるオプション({@link MusicConfigOptions} と同じ)。 */
export type MusicOptions = MusicConfigOptions;

/**
 * music プラグインをインストールします。
 *
 * `resolvers/` と `providers/` の2つのコンポーネント種別を追加し、
 * `this.services.audio` を提供します。コマンドは登録しません。
 */
export function music(options: MusicOptions = {}): Plugin {
	return definePlugin({
		name: "music",
		install(client) {
			const config = resolveMusicConfig(options);
			// コンテナ経由で配ることで、複数クライアントでも設定が混ざらない。
			client.container.musicConfig = config;

			client.stores.register(new TrackResolverStore());
			client.stores.register(new StreamProviderStore());

			client.register(AudioService, UrlResolver, HttpStreamProvider, ArchiveResolver);

			if (config.localDirectories.length > 0) {
				client.register(LocalFileResolver, LocalFileStreamProvider);
			}
			if (config.leaveOnEmpty !== false) {
				client.register(VoiceStateListener);
			}

			if (!Bun.which("ffmpeg")) {
				client.logger.warn(
					{ plugin: "music" },
					"ffmpeg が見つかりません。opus を含む .opus / .webm はそのまま再生できますが、mp3 や flac などの変換が必要な形式は再生できません",
				);
			}
		},
	});
}

// ---- 公開 API ----------------------------------------------------------

export { AudioService, type PlayOptions, type PlayResult } from "./AudioService.js";
export {
	defaultMusicConfig,
	musicConfigOf,
	resolveMusicConfig,
	type MusicConfig,
	type MusicConfigOptions,
	type MusicLimits,
	type MusicNetworkConfig,
	type MusicVoiceConfig,
} from "./config.js";
export {
	defaultMusicTexts,
	resolveMusicTexts,
	type MusicTexts,
	type MusicTextsOptions,
} from "./texts.js";
export { GuildQueue, type GuildQueueContext, type LoopMode } from "./GuildQueue.js";
export {
	TrackResolver,
	TrackResolverStore,
	type ResolveContext,
	type TrackResolverOptions,
} from "./TrackResolver.js";
export {
	StreamProvider,
	StreamProviderStore,
	StreamType,
	type AudioStream,
	type StreamOpenContext,
	type StreamProviderOptions,
} from "./StreamProvider.js";
export { createTrack, type Track } from "./track.js";
export { MusicError, NoProviderError, NoResultError, NotPlayingError } from "./errors.js";
export { MusicEvents, type MusicEvent } from "./events.js";
export {
	DEFAULT_AUDIO_EXTENSIONS,
	extensionOf,
	guessStreamType,
	looksLikeAudio,
	titleFrom,
} from "./format.js";

// 同梱コンポーネント(参考実装として公開)
export { UrlResolver } from "./builtin/UrlResolver.js";
export { HttpStreamProvider } from "./builtin/HttpStreamProvider.js";
export { ArchiveResolver } from "./builtin/ArchiveResolver.js";
export { LocalFileResolver, LocalFileStreamProvider } from "./builtin/local.js";

declare module "@cc-discord-framework/core" {
	interface Stores {
		resolvers: TrackResolverStore;
		providers: StreamProviderStore;
	}
}
