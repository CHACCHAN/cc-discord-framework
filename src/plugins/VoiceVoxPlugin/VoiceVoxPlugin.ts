import type { QueuePlugin } from "@core/modules";
import { Logger } from "@core/utils";
import { createAudioResource as CAR, StreamType, type AudioResource } from "@discordjs/voice";
import { Readable } from "stream";
import { Cache } from "@core/registry";
import axios from "axios";

export interface GenerateOptions {
    text: string;
    speakerId: number;
    speed?: number;
    pitch?: number;
    intonation?: number;
}

export class VoiceVoxPlugin implements QueuePlugin {
    private readonly baseUrl: string;
    private readonly cacheKey = "VoiceVoxCache";
    private guildId: string | null = null;
    private audioBuffer: Buffer | null = null;

    constructor(options?: { baseUrl?: string }) {
        this.baseUrl = options?.baseUrl ?? "http://voicevox:50021";
    }

    // 読み上げ場所登録
    public registerReadPlace(guildId: string, channelId: string): void {
        this.guildId = guildId;
        Cache.set(Cache.key(this.cacheKey, guildId), channelId);
    }

    // 読み上げ場所取得
    public getReadPlace(guildId: string): string | undefined {
        return Cache.get<string>(Cache.key(this.cacheKey, guildId));
    }
    
    // 読み上げ素材を生成
    public async generate(options: GenerateOptions): Promise<this> {
        try {
            const queryRes = await axios.post(`${this.baseUrl}/audio_query`, null, {
                params: { text: options.text, speaker: options.speakerId }
            });

            const queryData = queryRes.data;
            if (options.speed) queryData.speedScale = options.speed;
            if (options.pitch) queryData.pitchScale = options.pitch;
            if (options.intonation) queryData.intonationScale = options.intonation;

            const synthRes = await axios.post(`${this.baseUrl}/synthesis`, queryData, {
                params: { speaker: options.speakerId },
                responseType: "arraybuffer"
            });

            this.audioBuffer = Buffer.from(synthRes.data);
            return this;

        } catch (error) {
            Logger.error(error);
            throw error;
        }
    }

    // 音源データ作成
    public async createResource(): Promise<AudioResource> {
        if (!this.audioBuffer) {
            Logger.error("[VoiceVoxPlugin] 音声データが生成されていません")
            throw new Error("BUFFER_NOT_SET")
        }
        try {
            const stream = Readable.from(this.audioBuffer);
            return CAR(stream, { inputType: StreamType.Arbitrary });

        } catch (error) {
            Logger.error(error);
            throw error;
        }
    }

    // 解放時
    public async destroy(): Promise<void> {
        if (this.guildId) {
            Cache.delete(Cache.key(this.cacheKey, this.guildId));
        }
    }
}