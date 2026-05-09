import { ApplyMessageCommand, Message, MessageCommand, TextChannel } from "@core";

@ApplyMessageCommand({
    name: "read",
    description: "読み上げを開始します",
    aliases: ["read"],
    preconditions: ["inVoiceChannel", "requireReadLock"],
})

export class ReadCommand extends MessageCommand {
    public override async run(message: Message, args: string[]) {
        const { ReadComponent, EmbedTemplate, JoinTryComponent } = this.container;
        const textChannel = message.channel as TextChannel;

        // チャンネル参加試行
        if (!JoinTryComponent.try(message)) {
            return await (message.channel as TextChannel).send({
                embeds: [EmbedTemplate.error().setEmojiDescription("❌️", "読み上げを開始できませんでした")]
            });
        }

        // 読み上げ生成
        await ReadComponent.generateContent(message, {
            text: `${textChannel.name}を読み上げします`,
            speakerId: 3,
        });

        await textChannel.send({
            embeds: [EmbedTemplate.success()
                .setEmojiDescription("✅️", `<#${textChannel.id}> を読み上げします`)
            ]
        });
    }
}