import { ApplyMessageCreatePrecondition, Message, MessageCreatePrecondition, TextChannel } from "@core";

@ApplyMessageCreatePrecondition({
    name: "requireReadLock",
})

export class RequireReadLock extends MessageCreatePrecondition {
    public override async run(message: Message): Promise<boolean> {
        const { ResourceLockComponent } = this.container;
        return ResourceLockComponent.canUse(message, "Read");
    }

    public override async error(message: Message): Promise<void> {
        const { EmbedTemplate, ResourceLockComponent } = this.container;

        ResourceLockComponent.sendLockError(message, "Read", async (blockedBy) => {
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
        requireReadLock: never,
    }
}