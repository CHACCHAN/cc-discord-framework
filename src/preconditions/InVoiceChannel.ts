import { ApplyMessageCreatePrecondition, Message, MessageCreatePrecondition, TextChannel } from "@core";

@ApplyMessageCreatePrecondition({
    name: "inVoiceChannel",
})

export class InVoiceChannel extends MessageCreatePrecondition {
    public override async run(message: Message): Promise<boolean> {
        return !!message.member?.voice.channelId;
    }

    public override async error(message: Message): Promise<void> {
        const { EmbedTemplate } = this.container;

        await (message.channel as TextChannel).send({
            embeds: [EmbedTemplate.error().setEmojiDescription("❌️", "ボイスチャンネルに参加してください")]
        });
    }
}

declare module "@core/structures" {
    interface PreconditionRegistry {
        inVoiceChannel: never,
    }
}