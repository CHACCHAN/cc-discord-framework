import { Logger } from "@core/utils";
import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, joinVoiceChannel, NoSubscriberBehavior, VoiceConnection } from "@discordjs/voice";
import type { VoiceBasedChannel } from "discord.js";

// プラグインの共通基盤
export interface QueuePlugin {
    createResource(): Promise<AudioResource>;
    destroy?(): Promise<void>;
    callbacks?: Callbacks;
}

interface Callbacks {
    emptyQueue?: () => void;
    trackStart?: () => void;
}

interface AudioManagerState {
    connection: VoiceConnection | null;
    player: AudioPlayer;
    queue: QueuePlugin[];
    current: QueuePlugin | null;
    isProcessing: boolean;
}

export class AudioManager {
    private static states: Map<string, AudioManagerState> = new Map();
    private guildId: string;
    private callbacks: Callbacks | undefined;

    constructor(guildId: string) {
        this.guildId = guildId;
    }

    // 個別の状態を取得
    public get state(): AudioManagerState {
        let state = AudioManager.states.get(this.guildId);

        if (!state) {
            const player = createAudioPlayer({
                behaviors: { noSubscriber: NoSubscriberBehavior.Pause }
            });

            player.on(AudioPlayerStatus.Idle, () => this.player.play());
            player.on(AudioPlayerStatus.Playing, () => this.state.current?.callbacks?.trackStart?.());

            state = {
                connection: null,
                player: player,
                queue: [],
                current: null,
                isProcessing: false,
            };
            AudioManager.states.set(this.guildId, state);
        }

        return state;
    }

    // キュー入出力を取得
    public get queue() {
        return {
            // 追加
            add: (plugin: QueuePlugin) => {
                plugin.callbacks = this.callbacks;
                this.state.queue.push(plugin);
                this.player.play();
            },
            // 取り出す
            shift: (): QueuePlugin | undefined => { 
                return this.state.queue.shift();
            },
            // 現在再生中インスタンスを渡す
            current: <T extends QueuePlugin>(): T | null => {
                return this.state.current as T | null;
            }
        }
    }

    // プレイヤーを取得
    public get player() {
        return {
            play: async () => {
                const state = this.state;
                const player = state.player;

                if (state.isProcessing || player?.state.status !== AudioPlayerStatus.Idle) return;

                this.state.isProcessing = true; // プロセスロック
                let hasError = false;

                try {
                    const next = this.queue.shift();

                    if (!next) {
                        state.current?.callbacks?.emptyQueue?.();
                        state.current = null;
                        return;
                    }

                    state.current = next;
                    const resource = await next.createResource();
                    player.play(resource);

                } catch (error) {
                    Logger.error(error);
                    hasError = true;

                } finally {
                    state.isProcessing = false; // プロセス解放
                }

                if (hasError) this.player.play(); // プロセス解放後リトライ
            },
            pause: () => this.state.player.pause(),
            unpause: () => this.state.player.unpause(),
            skip: () => this.state.player.stop(),
        }
    }

    // コールバック関数登録
    public registerCallbacks(callbacks: Callbacks) {
        this.callbacks = callbacks;
    }

    // ボイスチャンネル接続
    public connect(voiceChannel: VoiceBasedChannel): boolean {
        try {
            this.state.connection?.destroy();
            this.state.connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
            this.state.connection.subscribe(this.state.player!);

            return true;

        } catch (error) {
            Logger.error(error);
            return false;
        }
    }

    // ボイスチャンネル切断
    public disconnect(options: { keepCache: boolean } = { keepCache: false}): boolean {
        try {
            if (!this.state.connection) return false;

            this.state.connection.destroy();
            this.state.current?.destroy?.();

            if (!options.keepCache) {
                AudioManager.states.delete(this.guildId);
            }

            return true;

        } catch (error) {
            Logger.error(error);
            return false;
        }
    }
}

declare module "@core/containersType" {
    interface ContainerEntries {
        AudioManager: typeof AudioManager;
    }
}