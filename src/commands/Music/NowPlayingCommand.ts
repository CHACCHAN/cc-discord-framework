import { ApplyMessageCommand, Message, MessageCommand, TextChannel, AudioPlayerStatus } from "@core";
import type { SoundCloudPlugin } from "@core/plugins";

@ApplyMessageCommand({
    name: "now_playing",
    description: "現在再生中の音楽と進捗を表示します",
    aliases: ["np", "now_playing"],
    preconditions: ["inVoiceChannel", "requireMusicLock"],
})

export class NowPlayingCommand extends MessageCommand {
    private static activeInstances = new Map<string, { intervalId: ReturnType<typeof setInterval>, sentMessage: Message }>();

    public override async run(message: Message, args: string[]) {
        const { AudioManager, EmbedTemplate, FormatTemplate } = this.container;
        const { formatDuration } = FormatTemplate;
        const guildId = message.guild?.id!;
        const manager = new AudioManager(message.guild?.id!);
        const textChannel = message.channel as TextChannel;
        const currentInstance = manager.queue.current<SoundCloudPlugin>();
        const emptyEmbed = EmbedTemplate.info().setEmojiDescription("📦", "現在再生中のものはありません");

        if (!currentInstance || !currentInstance.nowTrack) {
            return await textChannel.send({ embeds: [emptyEmbed] });
        }

        const track = currentInstance.nowTrack;
        const playerState = manager.state.player.state;

        if (playerState.status === AudioPlayerStatus.Idle) {
            return await textChannel.send({ embeds: [emptyEmbed] });
        }

        // 過去に実行していた場合は最新のに更新
        if (NowPlayingCommand.activeInstances.has(guildId)) {
            const oldInstance = NowPlayingCommand.activeInstances.get(guildId)!;
            clearInterval(oldInstance.intervalId);
            oldInstance.sentMessage.delete();
            NowPlayingCommand.activeInstances.delete(guildId);
        }

        const durationSeconds = track.durationInSec || 1;
        const totalBars = 15;
        const timePerBarMs = (durationSeconds / totalBars) * 1000;
        const safeIntervalMs = Math.max(3000, timePerBarMs); // 最低3秒は開ける

        const buildEmbed = (playbackSeconds: number) => {
            let progress = Math.round((playbackSeconds / durationSeconds) * totalBars);
            progress = Math.max(0, Math.min(progress, totalBars));

            const playedBars = Math.max(0, progress - 1);
            const leftBars = Math.max(0, totalBars - progress);
            const progressBar = `${"▬".repeat(playedBars)}🔘${"▬".repeat(leftBars)}`;

            return EmbedTemplate.success()
                .setMenuAuthor( ["NOW PLAYING", "/", "再生中"], message.member?.displayAvatarURL())
                .setTitle(track.name)
                .setURL(track.url)
                .setDescription(`\n${progressBar}\n\`${formatDuration(playbackSeconds)} / ${formatDuration(durationSeconds)}\`\n`)
                .setThumbnail(track.thumbnail)
                .setFooter({ text: "自動更新" })
                .addFields([
                    { name: '👤 Artist / Publisher', value: `\`${track.user?.name || 'Unknown'}\``, inline: true },
                    { name: '📂 Queue', value: `\`残り ${manager.state.queue.length} 曲\``, inline: true }
                ]);
        };

        // 初回のメッセージ送信
        const initialPlaybackSeconds = Math.floor((playerState.resource?.playbackDuration || 0) / 1000);
        const sentMessage = await textChannel.send({ embeds: [buildEmbed(initialPlaybackSeconds)] });

        const intervalId = setInterval(async () => {
            const currentState = manager.state.player.state;
            const currentQueue = manager.queue.current<SoundCloudPlugin>();

            // 再生が止まった、または別の曲にスキップされた場合消去
            if (
                currentState.status !== AudioPlayerStatus.Playing ||
                !currentQueue ||
                currentQueue.nowTrack?.url !== track.url
            ) {
                clearInterval(intervalId);
                NowPlayingCommand.activeInstances.delete(guildId);
                sentMessage.delete();
                return;
            }

            // 再構築
            const newPlaybackSeconds = Math.floor((currentState.resource?.playbackDuration || 0) / 1000);
            const updatedEmbed = buildEmbed(newPlaybackSeconds);

            try {
                await sentMessage.edit({ embeds: [updatedEmbed] });

            } catch (error) {
                clearInterval(intervalId); // メッセージが手動で削除された等のエラー時はループを止める
            }
        }, safeIntervalMs);

        // タイマーとメッセージを記憶
        NowPlayingCommand.activeInstances.set(guildId, { intervalId, sentMessage });
    }
}