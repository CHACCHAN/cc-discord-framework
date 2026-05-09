import type { QueuePlugin } from "@core/modules";
import { Logger } from "@core/utils";
import { createAudioResource as CAR, type AudioResource } from "@discordjs/voice";
import playDl, { SoundCloudTrack } from "play-dl";

interface SearchCallbacks {
    notFound?: () => void; 
    choice: (results: SoundCloudTrack[]) => Promise<string> | string | null;
}

export class SoundCloudPlugin implements QueuePlugin {
    public nowTrack: SoundCloudTrack | null = null;
    private static isReady: boolean = false;
    private url: string | null = null;

    constructor() {
        this.setup();
    }

    // 準備
    private async setup() {
        if (!SoundCloudPlugin.isReady) {
            const client_id = await playDl.getFreeClientID();
            await playDl.setToken({
                soundcloud: { client_id }
            });
            SoundCloudPlugin.isReady = true;
        }
    }

    // 検索
    public async search(
        query: string, 
        options: { limit: number } = { limit: 5 },
        callbacks: SearchCallbacks
    ): Promise<SoundCloudPlugin | null> {
        await this.setup();

        const results = await playDl.search(query, { 
            source: { soundcloud: "tracks" }, 
            limit: options.limit 
        });

        // 検索ヒットなし
        if (!results || results.length === 0) {
            callbacks.notFound?.();
            return null;
        }

        // urlを選択させる
        this.url = await callbacks.choice(results);
        if (!this.url) return null;

        this.nowTrack = results.find(t => t.url === this.url) || null;
        return this;
    }

    // 音源データ作成
    public async createResource(): Promise<AudioResource> {
        if (!this.url) {
            Logger.error("[SoundCloudPlugin] URLが設定されていません");
            throw new Error("URL_NOT_SET");
        }
        try {
            const streamData = await playDl.stream(this.url);
            return CAR(streamData.stream, { inputType: streamData.type });

        } catch (error) {
            Logger.error(error);
            throw error;
        }
    }
}
