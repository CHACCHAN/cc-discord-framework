import {
	ApplicationCommandOptionType,
	Command,
	type ChatInputCommandInteraction,
} from "@cc-discord-framework/core";
import { describeTrack, requirePlaybackVoiceChannel } from "./_shared.js";

@Command.define({
	description: "URLまたは検索語から曲を再生します。",
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: "query",
			description: "URL、または検索語",
			required: true,
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: "next",
			description: "キューの先頭へ割り込む",
			required: false,
		},
	],
})
export class PlayCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const channel = requirePlaybackVoiceChannel(this.services.audio, interaction);
		// 解決も接続も時間がかかるので、先に defer しておく。
		await interaction.deferReply();

		const { tracks, started } = await this.services.audio.play({
			channel,
			query: interaction.options.getString("query", true),
			requestedBy: interaction.user.id,
			// musicError のリスナーが通知先として使う。
			textChannel: interaction.channel ?? undefined,
			next: interaction.options.getBoolean("next") ?? false,
		});

		const head = describeTrack(tracks[0]!);
		const summary = tracks.length > 1 ? `${head} ほか${tracks.length - 1}曲` : head;
		// started は「実際に鳴り始めたか」。鳴らなかった理由は musicError 側で伝わる。
		const message = started
			? `▶️ 再生を開始します: ${summary}`
			: `➕ キューへ追加しました: ${summary}`;

		await interaction.editReply({ embeds: [this.services.ui.success(message)] });
	}
}
