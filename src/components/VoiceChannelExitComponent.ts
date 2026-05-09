import { ApplyComponent, BaseComponent, TextChannel } from "@core";

@ApplyComponent()

export class VoiceChannelExitComponent extends BaseComponent {
    public async exitRun(guildId: string, channel: TextChannel) {
        const { AudioManager, AudioResourceManager, EmbedTemplate } = this.container;
        const audioManager = new AudioManager(guildId);
        const resourceManager = new AudioResourceManager(guildId);

        if (audioManager.disconnect()) {
            resourceManager.dispose();
            await channel.send({
                embeds: [EmbedTemplate.success().setEmojiDescription("✅️", "退出しました")]
            });
            
        } else {
            await channel.send({
                embeds: [EmbedTemplate.error().setEmojiDescription("❌️", "退出できませんでした")]
            });
        }
    }
}

declare module "@core/containersType" {
    interface ContainerEntries {
        VoiceChannelExitComponent: VoiceChannelExitComponent
    }
}