import { ApplyMessageCommand, Message, MessageCommand, TextChannel } from "@core";

@ApplyMessageCommand({
    name: "exit",
    description: "退出します",
    aliases: ["exit"],
    preconditions: ["inVoiceChannel"],
})

export class ExitCommand extends MessageCommand {
    public override async run(message: Message, args: string[]) {
        const { VoiceChannelExitComponent } = this.container;
        const textChannel = message.channel as TextChannel;
        
        await VoiceChannelExitComponent.exitRun(message.guild?.id!, textChannel);
    }
}