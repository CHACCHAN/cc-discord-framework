import type { LoopMode } from "@cc-discord-framework/music";
import {
	ApplicationCommandOptionType,
	Command,
	type ChatInputCommandInteraction,
} from "cc-discord-framework";
import { LOOP_LABELS, requireQueue } from "./_shared.js";

@Command.define({
	description: "ループの動作を切り替えます。",
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: "mode",
			description: "ループの動作",
			required: true,
			// 表示名は LOOP_LABELS と同じものを使う(選択肢と応答文がずれないように)。
			choices: Object.entries(LOOP_LABELS).map(([value, name]) => ({ name, value })),
		},
	],
})
export class LoopCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const queue = requireQueue(this.services.audio, interaction);
		// 選択肢を絞ってあるので、届く値は LoopMode のいずれか。
		const mode = interaction.options.getString("mode", true) as LoopMode;

		queue.loop = mode;
		await interaction.reply({
			embeds: [this.services.ui.success(`🔁 ループを「${LOOP_LABELS[mode]}」にしました。`)],
		});
	}
}
