import { MusicError } from "@cc-discord-framework/music";
import {
	ApplicationCommandOptionType,
	Command,
	type ChatInputCommandInteraction,
} from "cc-discord-framework";
import { describeTrack, requireQueue } from "./_shared.js";

@Command.define({
	description: "待機中の曲をキューから取り除きます。",
	options: [
		{
			type: ApplicationCommandOptionType.Integer,
			name: "position",
			description: "取り除く曲の番号(/queue に出る番号)",
			required: true,
			min_value: 1,
		},
	],
})
export class RemoveCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const queue = requireQueue(this.services.audio, interaction);
		const position = interaction.options.getInteger("position", true);

		// /queue の表示は1始まり、キューの添字は0始まり。
		const removed = queue.remove(position - 1);
		if (!removed) throw new MusicError(`${position}番目の曲は待機列にありません。`);

		await interaction.reply({
			embeds: [
				this.services.ui.success(`🗑️ ${position}番目を取り除きました: ${describeTrack(removed)}`),
			],
		});
	}
}
