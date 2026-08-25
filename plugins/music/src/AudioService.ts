import { Service } from "@cc-discord-framework/core";
import type { TextBasedChannel, VoiceBasedChannel } from "discord.js";
import "./config.js";
import { MusicError, NoResultError } from "./errors.js";
import { GuildQueue } from "./GuildQueue.js";
import type { Track } from "./track.js";

/** {@link AudioService.play} の引数。 */
export interface PlayOptions {
	/** 接続先のボイスチャンネル。 */
	readonly channel: VoiceBasedChannel;
	/** URL または検索クエリ。 */
	readonly query: string;
	/** リクエストしたユーザーの ID。 */
	readonly requestedBy?: string;
	/**
	 * 通知先として `queue.textChannel` に記録するテキストチャンネル。
	 * プラグインはここへ送信しません(表示は Bot 側のリスナーの担当)。
	 */
	readonly textChannel?: TextBasedChannel;
	/** キュー先頭へ割り込む。 */
	readonly next?: boolean;
}

/** {@link AudioService.play} の戻り値。 */
export interface PlayResult {
	/** 対象ギルドのキュー。 */
	readonly queue: GuildQueue;
	/** 追加されたトラック(プレイリストなら複数)。 */
	readonly tracks: Track[];
	/**
	 * 追加によって **実際に再生が始まったか**。
	 *
	 * `false` になるのは「既存の再生に追加された」場合と、
	 * 「再生を試みたが音源を開けなかった」場合です(後者は
	 * `musicError` で通知されます)。
	 */
	readonly started: boolean;
}

/**
 * 音楽再生のエントリポイント。`this.services.audio` で参照できます。
 *
 * ```ts
 * const { tracks } = await this.services.audio.play({
 *   channel: member.voice.channel,
 *   query: "https://example.com/song.opus",
 *   requestedBy: member.id,
 * });
 * ```
 */
@Service.define()
export class AudioService extends Service {
	readonly #queues = new Map<string, GuildQueue>();

	/** ギルドの既存キューを返します。未接続なら `null`。 */
	public queue(guildId: string): GuildQueue | null {
		return this.#queues.get(guildId) ?? null;
	}

	/** 稼働中のすべてのキュー。 */
	public get queues(): readonly GuildQueue[] {
		return [...this.#queues.values()];
	}

	/** ギルドのキューを取得し、なければ作成します(接続はしません)。 */
	public ensureQueue(guildId: string): GuildQueue {
		const existing = this.#queues.get(guildId);
		if (existing && !existing.destroyed) return existing;

		const config = this.container.musicConfig;
		const queue = new GuildQueue({
			guildId,
			client: this.client,
			logger: this.logger.child({ guildId }),
			providers: this.container.stores.get("providers"),
			defaultVolume: config.defaultVolume,
			leaveOnEnd: config.leaveOnEnd,
			limits: config.limits,
			voice: config.voice,
			texts: config.texts,
			onDestroy: (q) => {
				if (this.#queues.get(q.guildId) === q) this.#queues.delete(q.guildId);
			},
		});
		this.#queues.set(guildId, queue);
		return queue;
	}

	/**
	 * クエリを解決してトラックを返します(キューには追加しません)。
	 * 検索結果の選択 UI を自作したい場合に使います。
	 */
	public async resolve(query: string, requestedBy: string | null = null): Promise<Track[]> {
		return this.container.stores.get("resolvers").resolve({ query, requestedBy });
	}

	/**
	 * クエリを解決してキューへ追加し、必要なら接続・再生を開始します。
	 *
	 * @throws NoResultError 再生可能な音源が見つからなかった場合。
	 */
	public async play(options: PlayOptions): Promise<PlayResult> {
		const tracks = await this.resolve(options.query, options.requestedBy ?? null);
		if (tracks.length === 0) {
			const { texts } = this.container.musicConfig;
			throw new NoResultError(texts.noResult(options.query), options.query);
		}

		const queue = this.ensureQueue(options.channel.guild.id);
		// 解決中に別チャンネルの再生が始まっていても、キューへ曲を
		// 混入させる前に再確認する。connect() 側も同時試行を直列化する。
		if (queue.voiceChannelId !== null && queue.voiceChannelId !== options.channel.id) {
			throw new MusicError(this.container.musicConfig.texts.voiceChannelMismatch, {
				identifier: "VoiceChannelMismatch",
			});
		}
		await queue.connect(options.channel);
		if (options.textChannel) queue.textChannel = options.textChannel;

		if (options.next) queue.insert(0, ...tracks);
		else queue.add(...tracks);

		// start() は最初の再生試行(ストリームを開くところ)まで待つので、
		// 戻ってきた時点で「本当に鳴り始めたか」が分かる。
		// 失敗した曲は飛ばされるため、ここで嘘をつかないようにする。
		const wasIdle = !queue.playing;
		if (wasIdle) await queue.start();
		const started = wasIdle && queue.playing;

		return { queue, tracks, started };
	}

	/** ギルドの再生を停止して切断します。 */
	public leave(guildId: string): boolean {
		const queue = this.#queues.get(guildId);
		if (!queue) return false;
		queue.destroy();
		return true;
	}

	/** クライアント終了時、すべてのギルドから切断します。 */
	override onUnload(): void {
		for (const queue of [...this.#queues.values()]) queue.destroy();
		this.#queues.clear();
	}
}

declare module "@cc-discord-framework/core" {
	interface Services {
		audio: AudioService;
	}
}
