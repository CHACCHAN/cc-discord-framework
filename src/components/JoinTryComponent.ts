import { ApplyComponent, BaseComponent, Message, TextChannel, VoiceConnectionStatus } from "@core";

@ApplyComponent()

export class JoinTryComponent extends BaseComponent {
    public try(message: Message): boolean {
        const { AudioManager, VoiceChannelExitComponent } = this.container;
        const guildId = message.guild?.id!;
        const manager = new AudioManager(guildId);

        if (!manager.state.connection) {
            // 接続試行
            if (!manager.connect(message.member?.voice.channel!)) {
                return false;
            }

            // ユーザ操作による退出時のイベントを設定
            const connection = manager.state.connection as any;
            connection?.on(VoiceConnectionStatus.Disconnected, () => {
                VoiceChannelExitComponent.exitRun(guildId, message.channel as TextChannel);
            });
        }
        
        return true;
    }
}

declare module "@core/containersType" {
    interface ContainerEntries {
        JoinTryComponent: JoinTryComponent
    }
}