import type { GuildQueue } from "./GuildQueue.js";
import type { Track } from "./track.js";

/**
 * music プラグインがクライアント上で発火するイベント。
 * 通常の discord.js エミッターに乗るため、`Listener` コンポーネントで
 * 型付きのまま観測できます。
 *
 * ```ts
 * @Listener.define({ event: "musicTrackStart" })
 * export class NowPlayingListener extends Listener<"musicTrackStart"> {
 *   override async run(queue: GuildQueue, track: Track) {
 *     await queue.textChannel?.send(`▶ ${track.title}`);
 *   }
 * }
 * ```
 */
export const MusicEvents = {
	/** 再生開始: `(queue, track)` */
	TrackStart: "musicTrackStart",
	/** 再生終了(スキップ含む): `(queue, track)` */
	TrackEnd: "musicTrackEnd",
	/** キューが空になった: `(queue)` */
	QueueEnd: "musicQueueEnd",
	/** ボイス接続の切断: `(queue)` */
	Disconnect: "musicDisconnect",
	/** 再生中のエラー: `(error, queue, track)` */
	Error: "musicError",
} as const;

export type MusicEvent = (typeof MusicEvents)[keyof typeof MusicEvents];

declare module "discord.js" {
	interface ClientEvents {
		musicTrackStart: [queue: GuildQueue, track: Track];
		musicTrackEnd: [queue: GuildQueue, track: Track];
		musicQueueEnd: [queue: GuildQueue];
		musicDisconnect: [queue: GuildQueue];
		musicError: [error: unknown, queue: GuildQueue, track: Track | null];
	}
}
