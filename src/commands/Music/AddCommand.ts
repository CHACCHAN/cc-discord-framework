import { ApplyMessageCommand, ButtonStyle, Message, MessageCommand, TextChannel } from "@core";
import { SoundCloudPlugin } from "@core/plugins";

@ApplyMessageCommand({
    name: "add",
    description: "引数に曲名を入れて追加します",
    aliases: ["add"],
    preconditions: ["inVoiceChannel", "requireMusicLock"],
})

export class AddCommand extends MessageCommand {
    public override async run(message: Message, args: string[]) {
        const { AudioManager, EmbedTemplate, PaginationTemplate, FormatTemplate, JoinTryComponent, VoiceChannelExitComponent } = this.container;
        const { formatDuration } = FormatTemplate;
        const guildId = message.guild?.id!;
        const manager = new AudioManager(guildId);
        const plugin = new SoundCloudPlugin();
        const textChannel = message.channel as TextChannel;
        const statusMessage = await textChannel.send({
            embeds: [EmbedTemplate.info().setEmojiDescription("🔍️", "検索しています")]
        });
        const query = args.join(" ");
        const instance = await plugin.search(query, { limit: 5 }, {
            notFound: async () => {
                await statusMessage.edit({
                    embeds: [EmbedTemplate.error().setEmojiDescription("❌️", `${query}が見つかりませんでした`)]
                });
            },
            choice: async (results) => {
                return new Promise(async (resolve) => {
                    // ページネーション作成
                    const tracks = results.slice(0, 5);
                    const pagination = new PaginationTemplate();
                    const embed = EmbedTemplate.info()
                        .setMenu("SELECT TRACK", "/", "楽曲選択")
                        .setDescription(">>> **下のボタンから、追加したい曲の番号を選択してください**")
                        .setThumbnail(tracks[0]!.thumbnail)
                        .addFields(tracks.map((track, i) => ({
                            name: `${i + 1}. ${track.name.slice(0, 50)}`,
                            value: `> 👤 \`${track.user.name || 'Unknown'}\` | ⏱️ \`${formatDuration(track.durationInMs)}\``
                        })));
                    
                    pagination.setButtons(
                        tracks.map((_, i) => ({
                            id: `add_select_${i}`,
                            label: `${i + 1}`,
                            style: ButtonStyle.Primary
                        }))
                    );
                    
                    // 表示
                    await pagination.render({ 
                        target: statusMessage, 
                        options: { embeds: [embed] }

                    });

                    // コレクターを設置
                    pagination.createCollector({
                        filter: (i) => i.user.id === message.author.id,
                        time: 30000,
                        onCollect: async (interaction, action) => {
                            const index = parseInt(action);

                            const selectedTrack = tracks[index];

                            // トラックがない
                            if (!selectedTrack) {
                                await interaction.update({
                                    embeds: [EmbedTemplate.error().setEmojiDescription("❌️", "選択したトラックが見つかりません")],
                                    components: [],
                                });
                                return resolve("");
                            }

                            // ボイスチャンネル参加を試行
                            if (!JoinTryComponent.try(message)) {
                                await interaction.update({
                                    embeds: [EmbedTemplate.error().setEmojiDescription("❌️", "接続に失敗しました")],
                                    components: [],
                                });
                                return resolve("");
                            }

                            await interaction.update({
                                embeds: [EmbedTemplate.info()
                                    .setMenu("TRACK QUEUED", "/", "追加完了")
                                    .setEmojiDescription("✅️", `[${selectedTrack.name}](${selectedTrack.url}) をキューに追加`)
                                ],
                                components: []
                            });
                            pagination.collector?.stop("selected");

                            manager.registerCallbacks({
                                emptyQueue: async () => {
                                    await textChannel.send({
                                        embeds: [EmbedTemplate.info().setEmojiDescription("🈳", "キューが空です")]
                                    });
                                },
                                trackStart: async () => {
                                    await textChannel.send({
                                        embeds: [EmbedTemplate.success()
                                            .setMenu("NOW PLAYING", "/", "再生開始")
                                            .setEmojiDescription("🎵", `${selectedTrack.name} を再生します`)
                                            .setThumbnail(selectedTrack?.thumbnail)
                                        ]
                                    });
                                },
                            });

                            resolve(selectedTrack.url);
                        },
                        onEnd: async (_, reason) => {
                            if (reason === "selected") return;

                            await statusMessage.edit({
                                embeds: [EmbedTemplate.error().setEmojiDescription("⏰️", "タイムアウトしました")],
                                components: []
                            });
                            resolve("");
                        }
                    });
                });
            }
        });

        if (!instance) return;

        // キューに追加
        manager.queue.add(instance);
    }
}