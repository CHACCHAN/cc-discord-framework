import { ApplyMessageCreatePrecondition, Message, MessageCreatePrecondition, TextChannel } from "@core";

@ApplyMessageCreatePrecondition({
    name: "requireMusicLock",
})

export class RequireMusicLock extends MessageCreatePrecondition {
    public override async run(message: Message): Promise<boolean> {
        const { ResourceLockComponent } = this.container;
        
        return ResourceLockComponent.canUse(message, "Music");
    }

    public override async error(message: Message): Promise<void> {
        const { EmbedTemplate, ResourceLockComponent } = this.container;

        ResourceLockComponent.sendLockError(message, "Music", async (blockedBy) => {
            await (message.channel as TextChannel).send({
                embeds: [
                    EmbedTemplate.error()
                    .setEmojiDescription("❌️", `現在ボイスチャンネルは \`${blockedBy}\` が占有しています`)
                ]
            });
        });
    }
}

declare module "@core/structures" {
    interface PreconditionRegistry {
        requireMusicLock: never,
    }
}