import { Message, DefaultMessageCreateListener, ApplyListener, Events } from "@core";
import { VoiceVoxPlugin } from "@core/plugins";

@ApplyListener({ eventName: Events.MessageCreate })

export class MessageCreate extends DefaultMessageCreateListener {
    public override async execute(message: Message) {
        const { ReadComponent, HonoComponent } = this.container;
        const voiceVoxPlugin = new VoiceVoxPlugin();
        const guildId = message.guild?.id!;
        const readPlace = voiceVoxPlugin.getReadPlace(guildId);

        // 読み上げチャンネルなら
        if (message.channel.id === readPlace) {
            await ReadComponent.generateContent(message, {
                text: message.content,
                speakerId: 3,
            });
        }
    }
}