import { ApplyComponent, BaseComponent, Message, TextChannel } from "@core";
import { VoiceVoxPlugin, type GenerateOptions } from "@core/plugins";

@ApplyComponent()

export class ReadComponent extends BaseComponent {
    public async generateContent(message: Message, options: GenerateOptions) {
        const { AudioManager } = this.container;
        const guildId = message.guild?.id!;
        const manager = new AudioManager(guildId);
        const plugin = new VoiceVoxPlugin();

        plugin.registerReadPlace(guildId, message.channel.id);

        const instance = await plugin.generate(options);
        manager.queue.add(instance);
    }
}

declare module "@core/containersType" {
    interface ContainerEntries {
        ReadComponent: ReadComponent
    }
}