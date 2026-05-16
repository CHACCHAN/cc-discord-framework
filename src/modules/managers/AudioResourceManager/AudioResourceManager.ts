export class AudioResourceManager {
    private static useResouces = new Map<string, string>();
    private readonly guildId: string;

    constructor(guildId: string) {
        this.guildId = guildId;
    }

    // リソースの利用宣言 (ロックの取得)
    public use(feature: string, callbacks: {
        alreadyInUse: (currentFeature: string) => void;
    }): boolean {
        const current = AudioResourceManager.useResouces.get(this.guildId);

        if (current && current !== feature) {
            callbacks.alreadyInUse(current);
            return false;
        }

        AudioResourceManager.useResouces.set(this.guildId, feature);
        return true;
    }

    // リソースの解放
    public dispose() {
        AudioResourceManager.useResouces.delete(this.guildId);
    }
}

declare module "@core/containersType" {
    interface ContainerEntries {
        AudioResourceManager: typeof AudioResourceManager;
    }
}