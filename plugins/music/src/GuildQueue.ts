import {
	AudioPlayerStatus,
	VoiceConnectionStatus,
	createAudioPlayer,
	createAudioResource,
	entersState,
	joinVoiceChannel,
	StreamType,
	type AudioPlayer,
	type AudioResource,
	type VoiceConnection,
} from "@discordjs/voice";
import type { Client, Logger } from "@cc-discord-framework/core";
import type { TextBasedChannel, VoiceBasedChannel } from "discord.js";
import { defaultMusicConfig, type MusicLimits, type MusicVoiceConfig } from "./config.js";
import { MusicEvents } from "./events.js";
import { MusicError, NoProviderError, NotPlayingError } from "./errors.js";
import type { AudioStream, StreamProviderStore } from "./StreamProvider.js";
import type { MusicTexts } from "./texts.js";
import type { Track } from "./track.js";

/** ループの挙動。 */
export type LoopMode = "off" | "track" | "queue";

/**
 * 1曲の再生試行の結果。`"cancelled"` は「読み込み中に skip / stop /
 * destroy が割り込んだ」ことを表し、失敗回数には数えません。
 */
type TryPlayResult = "played" | "failed" | "cancelled";

/** @internal {@link GuildQueue} の構築に必要な依存。 */
export interface GuildQueueContext {
	readonly guildId: string;
	readonly client: Client;
	readonly logger: Logger;
	readonly providers: StreamProviderStore;
	readonly defaultVolume: number;
	readonly leaveOnEnd: number | false;
	readonly onDestroy: (queue: GuildQueue) => void;
	/** 数量の上限。省略すると既定値。 */
	readonly limits?: MusicLimits;
	/** ボイス接続の挙動。省略すると既定値。 */
	readonly voice?: MusicVoiceConfig;
	/** エラー文言。省略すると既定値。 */
	readonly texts?: MusicTexts;
}

/**
 * 1ギルド分の音楽セッション。ボイス接続・プレイヤー・キューをまとめて
 * 保持します。`this.services.audio.queue(guildId)` で取得できます。
 */
export class GuildQueue {
	/** 対象ギルドの ID。 */
	public readonly guildId: string;

	/**
	 * 通知先として記録しておくテキストチャンネル(任意)。
	 * プラグインはここへ送信しません。`musicError` などのリスナーで
	 * Bot 側が使うための控えです。
	 */
	public textChannel: TextBasedChannel | null = null;

	/** ループの挙動。 */
	public loop: LoopMode = "off";

	readonly #context: GuildQueueContext;
	readonly #limits: MusicLimits;
	readonly #voice: MusicVoiceConfig;
	readonly #texts: MusicTexts;
	readonly #player: AudioPlayer;
	readonly #tracks: Track[] = [];
	readonly #history: Track[] = [];

	#connection: VoiceConnection | null = null;
	#resource: AudioResource | null = null;
	#current: Track | null = null;
	#volume: number;
	#leaveTimer: ReturnType<typeof setTimeout> | null = null;
	/** HTTP 接続など、現在の音源読み込み・ストリームに連動する中断シグナル。 */
	#streamAbortController: AbortController | null = null;
	/** 同じ VoiceConnection へ切断リスナーを重複登録しないための控え。 */
	#disconnectListener: {
		readonly connection: VoiceConnection;
		readonly listener: () => void;
	} | null = null;
	/** 同時 connect の接続先を1つに固定するための進行中試行。 */
	#connectionAttempt: {
		readonly channelId: string;
		readonly controller: AbortController;
		readonly promise: Promise<void>;
	} | null = null;
	#destroyed = false;
	/** 次のトラックへ進む処理が二重に走らないようにするフラグ。 */
	#advancing = false;
	/** 直前の停止が明示的なスキップだったか(loop: "track" を無視するため)。 */
	#skipped = false;
	/**
	 * 割り込み操作(skip / clear / stop / destroy)の世代番号。
	 * ストリームを開く await の間に進んでいたら、そのトラックはもう
	 * 再生しません({@link GuildQueue.#tryPlay})。yt-dlp などで読み込みに
	 * 数秒かかる隙間に割り込まれても、破棄済みキューが鳴り始めたり
	 * スキップしたはずの曲が流れたりしないようにするためのものです。
	 */
	#epoch = 0;

	/** @internal AudioService が生成します。 */
	public constructor(context: GuildQueueContext) {
		this.#context = context;
		this.#limits = context.limits ?? defaultMusicConfig.limits;
		this.#voice = context.voice ?? defaultMusicConfig.voice;
		this.#texts = context.texts ?? defaultMusicConfig.texts;
		this.guildId = context.guildId;
		// 既定値も setter と同じクランプを通す(上限より大きい既定値を
		// 渡されても、/volume で戻せない値にならないように)。
		this.#volume = this.#clampVolume(context.defaultVolume);
		this.#player = createAudioPlayer({
			behaviors: { noSubscriber: this.#voice.noSubscriberBehavior },
		});

		this.#player.on(AudioPlayerStatus.Idle, () => {
			this.#abortStream();
			const finished = this.#current;
			this.#current = null;
			this.#resource = null;
			if (finished) this.#emit(MusicEvents.TrackEnd, this, finished);
			void this.#advance(finished);
		});

		this.#player.on("error", (error) => {
			this.#context.logger.error({ err: error, guildId: this.guildId }, "再生エラー");
			this.#reportError(error, this.#current);
		});
	}

	// ---- 状態 ------------------------------------------------------------

	/** 再生待ちのトラック(読み取り専用)。 */
	public get tracks(): readonly Track[] {
		return this.#tracks;
	}

	/** 再生中のトラック。 */
	public get current(): Track | null {
		return this.#current;
	}

	/** 再生済みのトラック(新しい順・最大 `limits.historySize` 件)。 */
	public get history(): readonly Track[] {
		return this.#history;
	}

	/** 何かを再生中か(一時停止中も含む)。 */
	public get playing(): boolean {
		return this.#current !== null;
	}

	/** 一時停止中か。 */
	public get paused(): boolean {
		return (
			this.#player.state.status === AudioPlayerStatus.Paused ||
			this.#player.state.status === AudioPlayerStatus.AutoPaused
		);
	}

	/** 接続中のボイスチャンネル ID。 */
	public get voiceChannelId(): string | null {
		return this.#connection?.joinConfig.channelId ?? null;
	}

	/** 現在トラックの再生位置(ミリ秒)。 */
	public get playbackDuration(): number {
		return this.#resource?.playbackDuration ?? 0;
	}

	/** 破棄済みか。 */
	public get destroyed(): boolean {
		return this.#destroyed;
	}

	/** 音量(0〜`limits.maxVolume`、1 が原音)。 */
	public get volume(): number {
		return this.#volume;
	}

	public set volume(value: number) {
		this.#volume = this.#clampVolume(value);
		this.#resource?.volume?.setVolume(this.#volume);
	}

	/** 音量を 0〜`limits.maxVolume` に収めます(既定値も setter もここを通します)。 */
	#clampVolume(value: number): number {
		return Math.max(0, Math.min(this.#limits.maxVolume, value));
	}

	// ---- キュー操作 --------------------------------------------------------

	/** キュー末尾へ追加します。 */
	public add(...tracks: Track[]): void {
		this.#tracks.push(...tracks);
		this.#cancelLeaveTimer();
	}

	/** 指定位置へ挿入します(0 が次に再生される位置)。 */
	public insert(index: number, ...tracks: Track[]): void {
		this.#tracks.splice(Math.max(0, index), 0, ...tracks);
		this.#cancelLeaveTimer();
	}

	/** 指定位置のトラックを取り除いて返します。 */
	public remove(index: number): Track | null {
		if (index < 0 || index >= this.#tracks.length) return null;
		return this.#tracks.splice(index, 1)[0] ?? null;
	}

	/** キュー内でトラックを移動します。 */
	public move(from: number, to: number): boolean {
		const track = this.remove(from);
		if (!track) return false;
		this.#tracks.splice(Math.max(0, Math.min(to, this.#tracks.length)), 0, track);
		return true;
	}

	/** 待機列を空にします(再生中の曲は止めません)。 */
	public clear(): void {
		this.#tracks.length = 0;
		// まだ鳴り始めていない読み込み中のトラックは「待機列」の一部なので、
		// ここで無効化する(すでに再生中の曲はそのまま)。
		this.#epoch++;
		if (this.#advancing && !this.#current) this.#abortStream();
	}

	/** 待機列をシャッフルします。 */
	public shuffle(): void {
		for (let i = this.#tracks.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.#tracks[i], this.#tracks[j]] = [this.#tracks[j]!, this.#tracks[i]!];
		}
	}

	// ---- 再生制御 ----------------------------------------------------------

	/** 再生を開始します。すでに再生中、またはキューが空なら何もしません。 */
	public async start(): Promise<void> {
		if (this.#current || this.#destroyed) return;
		await this.#advance(null);
	}

	/**
	 * 現在のトラックをスキップします。`count` 曲まとめてスキップできます。
	 * `loop: "track"` は無視されます(同じ曲が繰り返されない)。
	 *
	 * @returns 実際にスキップした数(再生中の1曲 + キューから外した数)。
	 *   キューに残っている以上の `count` を渡しても、あるだけしか
	 *   飛ばせません — 表示にはこの戻り値を使ってください。
	 */
	public skip(count = 1): number {
		if (this.#destroyed) return 0;
		// stop() は同期的に次のトラックへ進み #current を書き換えるので、
		// 「再生中(または読み込み中)の1曲」は止める前に数えておく。
		const active = this.#current !== null || this.#advancing ? 1 : 0;
		const removed = count > 1 ? this.#tracks.splice(0, count - 1).length : 0;
		this.#skipped = true;
		// 読み込み中のトラックがあれば、それも「スキップ済み」として無効化する。
		this.#epoch++;
		this.#abortStream();
		this.#player.stop(true);
		return removed + active;
	}

	/** 一時停止します。 */
	public pause(): boolean {
		return this.#player.pause(true);
	}

	/** 再開します。 */
	public resume(): boolean {
		return this.#player.unpause();
	}

	/** 再生を止め、キューを空にして切断します。 */
	public stop(): void {
		this.clear();
		this.loop = "off";
		this.destroy();
	}

	// ---- 接続 --------------------------------------------------------------

	/**
	 * ボイスチャンネルへ接続します。Ready の同一接続だけを再利用します。
	 * 同じ試行中に別チャンネルから呼ばれた場合は、後発側を拒否します。
	 */
	public connect(channel: VoiceBasedChannel): Promise<void> {
		if (this.#destroyed) {
			return Promise.reject(new NotPlayingError(this.#texts.nothingPlaying));
		}
		const pending = this.#connectionAttempt;
		if (pending) {
			if (pending.channelId !== channel.id) {
				return Promise.reject(
					new MusicError(this.#texts.voiceChannelMismatch, {
						identifier: "VoiceChannelMismatch",
					}),
				);
			}
			return pending.promise;
		}

		const controller = new AbortController();
		const promise = this.#connect(channel, controller.signal);
		this.#connectionAttempt = { channelId: channel.id, controller, promise };
		const clear = () => {
			if (this.#connectionAttempt?.promise === promise) this.#connectionAttempt = null;
		};
		promise.then(clear, clear);
		return promise;
	}

	/** connect() の1試行分。並行制御は公開メソッド側で行います。 */
	async #connect(channel: VoiceBasedChannel, signal: AbortSignal): Promise<void> {
		const existing = this.#connection;
		if (existing && this.voiceChannelId === channel.id) {
			if (existing.state.status === VoiceConnectionStatus.Ready) return;
			// 接続途中の同時呼び出しなら同じ接続を待つ。失敗済み・切断済みで
			// Ready になれなければ下の後始末で破棄し、次回は作り直す。
			await this.#waitUntilReady(existing, signal);
			return;
		}

		const connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
			selfDeaf: this.#voice.selfDeaf,
		});
		this.#connection = connection;
		this.#watchDisconnection(connection);

		connection.subscribe(this.#player);
		await this.#waitUntilReady(connection, signal);
	}

	/** 切断してこのキューを破棄します。 */
	public destroy(): void {
		if (this.#destroyed) return;
		this.#destroyed = true;
		// 読み込み中のトラックがあっても、破棄後に鳴り始めないようにする。
		this.#epoch++;
		this.#connectionAttempt?.controller.abort();
		this.#abortStream();
		this.#cancelLeaveTimer();
		this.#player.stop(true);
		if (this.#connection) this.#discardConnection(this.#connection);
		this.#current = null;
		this.#resource = null;
		this.#emit(MusicEvents.Disconnect, this);
		this.#context.onDestroy(this);
	}

	// ---- 内部 --------------------------------------------------------------

	/** 終了したトラックを処理し、次に再生できるものが見つかるまで進みます。 */
	async #advance(finished: Track | null): Promise<void> {
		if (this.#destroyed || this.#advancing) return;
		this.#advancing = true;
		const skipped = this.#skipped;
		this.#skipped = false;

		try {
			if (finished) {
				this.#history.unshift(finished);
				if (this.#history.length > this.#limits.historySize) this.#history.pop();
				// スキップ時は "track" ループを無視する(同じ曲に戻らない)。
				if (this.loop === "track" && !skipped) this.#tracks.unshift(finished);
				else if (this.loop === "queue") this.#tracks.push(finished);
			}

			// 再生に失敗しても止まらず、成功するかキューが尽きるまで進む。
			const maxFailures = this.#limits.maxConsecutiveFailures;
			for (let failures = 0; failures < maxFailures; ) {
				if (this.#destroyed) return;
				const next = this.#tracks.shift();
				if (!next) {
					this.#emit(MusicEvents.QueueEnd, this);
					this.#scheduleLeave();
					return;
				}
				const result = await this.#tryPlay(next);
				if (result === "played") return;
				if (result === "cancelled") {
					// 読み込み中に skip / stop されたトラック。失敗には数えない。
					if (this.#destroyed) return;
					// skip() が立てたフラグはここで消費する。残すと、次の
					// トラックが終わったときに loop: "track" を誤って抑制する。
					this.#skipped = false;
					continue;
				}
				failures++;
			}

			this.#context.logger.error(
				{ guildId: this.guildId },
				`${maxFailures}曲連続で再生に失敗したため停止します`,
			);
			// 失敗上限で止めた場合は未試行トラックが残る。ユーザー操作が
			// なければ、それを理由に leaveOnEnd を妨げない。
			this.#scheduleLeave(true);
		} finally {
			this.#advancing = false;
		}
	}

	/**
	 * 1曲を再生します。ストリームを開いている間(数秒かかることがある)に
	 * skip / stop / destroy が割り込んだ場合は、開いた資源を閉じて
	 * `"cancelled"` を返し、再生を始めません。
	 */
	async #tryPlay(track: Track): Promise<TryPlayResult> {
		// await の間に割り込みが入ったかを世代番号で検出する。
		const epoch = this.#epoch;
		// catch でも閉じられるよう、try の外に持つ。open に成功したあと
		// createAudioResource などが同期 throw すると、ここに開きっぱなしの
		// ストリーム(= 子プロセス)が残る。
		let audio: AudioStream | null = null;
		const abortController = new AbortController();
		this.#abortStream();
		this.#streamAbortController = abortController;
		let played = false;
		try {
			audio = await this.#context.providers.open(track, {
				signal: abortController.signal,
			});
			if (this.#destroyed || epoch !== this.#epoch) {
				// 誰も消費しないストリームを確実に閉じる(close を契機に
				// プロバイダー側の子プロセスも後始末される)。
				audio?.stream.destroy();
				this.#context.logger.debug(
					{ track: track.title, guildId: this.guildId },
					"読み込み中に操作が割り込んだため、このトラックは再生しません",
				);
				return "cancelled";
			}
			if (!audio) throw new NoProviderError(this.#texts.noProvider(track.title), track.title);

			const resource = createAudioResource(audio.stream, {
				inputType: audio.type ?? StreamType.Arbitrary,
				inlineVolume: true,
			});
			resource.volume?.setVolume(this.#volume);

			this.#current = track;
			this.#resource = resource;
			this.#player.play(resource);
			this.#emit(MusicEvents.TrackStart, this, track);
			played = true;
			return "played";
		} catch (error) {
			// 開けていたのに再生まで辿り着けなかった場合、失敗でも割り込みでも
			// ストリームは誰にも消費されない。閉じ忘れると子プロセスが残る。
			audio?.stream.destroy();
			if (this.#destroyed || epoch !== this.#epoch) {
				// 割り込みで不要になったトラックの失敗は報告しない。
				this.#context.logger.debug(
					{ err: error, track: track.title, guildId: this.guildId },
					"読み込み中に操作が割り込んだため、このトラックの失敗は無視します",
				);
				return "cancelled";
			}
			this.#context.logger.warn(
				{ err: error, track: track.title, guildId: this.guildId },
				"トラックの再生に失敗したため次へ進みます",
			);
			this.#reportError(error, track);
			return "failed";
		} finally {
			// 再生中は skip / destroy が本文ストリームも中断できるよう保持する。
			// 再生へ到達しなかった場合だけ、ここで直ちに後始末する。
			if (!played && this.#streamAbortController === abortController) {
				this.#abortStream();
			}
		}
	}

	#scheduleLeave(ignoreQueuedTracks = false): void {
		const delay = this.#context.leaveOnEnd;
		if (delay === false) return;
		this.#cancelLeaveTimer();
		this.#leaveTimer = setTimeout(() => {
			if (!this.playing && (ignoreQueuedTracks || this.#tracks.length === 0)) this.destroy();
		}, delay);
	}

	/** 現在の音源取得・本文ストリームへ中断を通知します。 */
	#abortStream(): void {
		this.#streamAbortController?.abort();
		this.#streamAbortController = null;
	}

	/** VoiceConnection ごとに切断監視を一度だけ登録します。 */
	#watchDisconnection(connection: VoiceConnection): void {
		if (this.#disconnectListener?.connection === connection) return;
		this.#removeDisconnectionListener();

		const listener = () => {
			const reconnect = this.#voice.reconnectTimeout;
			// チャンネル移動などの一時的な切断からの復帰を待ち、駄目なら破棄する。
			void Promise.race([
				entersState(connection, VoiceConnectionStatus.Signalling, reconnect),
				entersState(connection, VoiceConnectionStatus.Connecting, reconnect),
			]).catch(() => {
				if (this.#connection === connection) this.destroy();
			});
		};
		connection.on(VoiceConnectionStatus.Disconnected, listener);
		this.#disconnectListener = { connection, listener };
	}

	/** 登録中の切断監視を解除します。 */
	#removeDisconnectionListener(connection?: VoiceConnection): void {
		const watched = this.#disconnectListener;
		if (!watched || (connection && watched.connection !== connection)) return;
		watched.connection.off(VoiceConnectionStatus.Disconnected, watched.listener);
		this.#disconnectListener = null;
	}

	/** Ready 待機に失敗した接続を残さず、次回の再接続を可能にします。 */
	async #waitUntilReady(connection: VoiceConnection, cancellation: AbortSignal): Promise<void> {
		const timeout = new AbortController();
		const timer = setTimeout(() => timeout.abort(), this.#voice.readyTimeout);
		try {
			await entersState(
				connection,
				VoiceConnectionStatus.Ready,
				AbortSignal.any([cancellation, timeout.signal]),
			);
		} catch (error) {
			if (this.#connection === connection) this.#discardConnection(connection);
			throw error;
		} finally {
			clearTimeout(timer);
		}
	}

	/** 接続と、その接続に紐づくリスナーをまとめて破棄します。 */
	#discardConnection(connection: VoiceConnection): void {
		this.#removeDisconnectionListener(connection);
		if (this.#connection === connection) this.#connection = null;
		try {
			connection.destroy();
		} catch {
			// すでに破棄済みの接続は無視する。
		}
	}

	#cancelLeaveTimer(): void {
		if (this.#leaveTimer) {
			clearTimeout(this.#leaveTimer);
			this.#leaveTimer = null;
		}
	}

	/**
	 * 再生エラーを `musicError` イベントとして知らせます。
	 *
	 * プラグインの仕事は **発火するところまで** です。ユーザーへ見せるか
	 * どうか・どう見せるかは Bot の機能なので、`listeners/` に
	 * `musicError` のリスナーを置いて Bot 側で決めてください。
	 */
	#reportError(error: unknown, track: Track | null): void {
		this.#emit(MusicEvents.Error, error, this, track);
	}

	/** クライアント上へ music のイベントを発火します。 */
	#emit(event: string, ...args: unknown[]): void {
		// 引数の型は events.ts の ClientEvents 拡張が保証する。
		(this.#context.client.emit as (e: string, ...a: unknown[]) => boolean)(event, ...args);
	}
}
