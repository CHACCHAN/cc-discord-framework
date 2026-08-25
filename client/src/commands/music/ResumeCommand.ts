import { MusicError } from "@cc-discord-framework/music";
import { Command, type ChatInputCommandInteraction } from "@cc-discord-framework/core";
import { requireQueue } from "./_shared.js";

@Command.define({ description: "一時停止した再生を再開します。" })
export class ResumeCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const queue = requireQueue(this.services.audio, interaction);
		if (!queue.paused) throw new MusicError("一時停止していません。");

		queue.resume();
		await interaction.reply({ embeds: [this.services.ui.success("▶️ 再生を再開しました。")] });
	}
}
