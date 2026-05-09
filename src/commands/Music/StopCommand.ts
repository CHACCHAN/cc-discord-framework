import { ApplyMessageCommand, Message, MessageCommand, TextChannel } from "@core";

@ApplyMessageCommand({
    name: "stop",
    description: "曲を一時停止します",
    aliases: ["stop"],
    preconditions: ["inVoiceChannel", "requireMusicLock"],
})

export class StopCommand extends MessageCommand {
    public override async run(message: Message, args: string[]) {
        const { AudioManager, EmbedTemplate } = this.container;
        const manager = new AudioManager(message.guild?.id!);
        const textChannel = message.channel as TextChannel;
        
        if (manager.player.pause()) {
            await textChannel.send({
                embeds: [EmbedTemplate.info().setEmojiDescription("⏹️", "一時停止しました")]
            });
            
        } else {
            await textChannel.send({
                embeds: [EmbedTemplate.error().setEmojiDescription("❌️", "一時停止できませんでした")]
            });
        }
    }
}