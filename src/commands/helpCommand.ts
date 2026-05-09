import { ApplyMessageCommand, Logger, Message, MessageCommand, TextChannel } from "@core";
import { SoundCloudPlugin, VoiceVoxPlugin } from "@core/plugins";

@ApplyMessageCommand({
    name: "help",
    description: "ヘルプコマンド",
    aliases: ["h", "help"],
})

export class HelpCommand extends MessageCommand {
    public override async run(message: Message, args: string[]) {
        // const { AudioManager } = this.container;
        // const manager = new AudioManager(message.guild?.id!);
        // const plugin = new VoiceVoxPlugin();
        // const instance = await plugin.generate({
        //     text: "テストメッセージです",
        //     speakerId: 3,
        // });

        // manager.registerCallbacks({
        //     emptyQueue: () => Logger.info('キューが空'),
        //     trackStart: () => Logger.info('音楽再生開始')
        // });
        // manager.connect(message.member?.voice.channel!);
        // manager.queue.add(instance);

        return await (message.channel as TextChannel).send({
            content: 'テスト'
        });
    }
}