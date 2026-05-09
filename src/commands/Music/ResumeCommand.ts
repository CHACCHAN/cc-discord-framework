import { ApplyMessageCommand, Message, MessageCommand, TextChannel } from "@core";

@ApplyMessageCommand({
    name: "resume",
    description: "曲を再開します",
    aliases: ["resume"],
    preconditions: ["inVoiceChannel", "requireMusicLock"],
})

export class ResumeCommand extends MessageCommand {
    public override async run(message: Message, args: string[]) {
        const { AudioManager, EmbedTemplate } = this.container;
        const manager = new AudioManager(message.guild?.id!);
        const textChannel = message.channel as TextChannel;
        
        if (manager.player.unpause()) {
            await textChannel.send({
                embeds: [EmbedTemplate.info().setEmojiDescription("🔁", "再開しました")]
            });
            
        } else {
            await textChannel.send({
                embeds: [EmbedTemplate.error().setEmojiDescription("❌️", "再開できませんでした")]
            });
        }
    }
}