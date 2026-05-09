import { ApplyMessageCommand, Message, MessageCommand, TextChannel } from "@core";

@ApplyMessageCommand({
    name: "skip",
    description: "曲をスキップします",
    aliases: ["skip"],
    preconditions: ["inVoiceChannel", "requireMusicLock"],
})

export class SkipCommand extends MessageCommand {
    public override async run(message: Message, args: string[]) {
        const { AudioManager, EmbedTemplate } = this.container;
        const manager = new AudioManager(message.guild?.id!);
        const textChannel = message.channel as TextChannel;
        
        if (manager.player.skip()) {
            await textChannel.send({
                embeds: [EmbedTemplate.info().setEmojiDescription("⏭️", "スキップしました")]
            });
            
        } else {
            await textChannel.send({
                embeds: [EmbedTemplate.error().setEmojiDescription("❌️", "スキップできませんでした")]
            });
        }
    }
}