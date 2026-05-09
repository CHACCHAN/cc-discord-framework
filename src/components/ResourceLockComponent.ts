import { ApplyComponent, BaseComponent, Message, TextChannel } from "@core";

@ApplyComponent()

export class ResourceLockComponent extends BaseComponent {
    private readonly cacheIndex = "LockError";

    // ロック取得
    public canUse(message: Message, feature: string): boolean {
        const { AudioResourceManager } = this.container;
        const guildId = message.guild?.id!;
        const manager = new AudioResourceManager(guildId);

        const canUse = manager.use(feature, {
            alreadyInUse: (currentFeature) => {
                const cacheKey = this.cache.key(this.cacheIndex, feature, guildId);
                this.cache.set(cacheKey, currentFeature, 10000);
            }
        });

        return canUse;
    }

    // エラー共通処理
    public async sendLockError(message: Message, feature: string, callback: (blockedBy: string) => Promise<void>) {
        const guildId = message.guild?.id!;
        const cacheKey = this.cache.key(this.cacheIndex, feature, guildId);
        const blockedBy = this.cache.get<string>(cacheKey) || "Unknown";

        this.cache.delete(cacheKey);
        await callback(blockedBy);
    }
}

declare module "@core/containersType" {
    interface ContainerEntries {
        ResourceLockComponent: ResourceLockComponent
    }
}