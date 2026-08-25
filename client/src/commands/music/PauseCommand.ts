import { MusicError } from "@cc-discord-framework/music";
import { Command, type ChatInputCommandInteraction } from "cc-discord-framework";
import { requireQueue } from "./_shared.js";

@Command.define({ description: "再生を一時停止します。" })
export class PauseCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const queue = requireQueue(this.services.audio, interaction);
		if (queue.paused) throw new MusicError("すでに一時停止しています。");

		queue.pause();
		await interaction.reply({ embeds: [this.services.ui.success("⏸️ 一時停止しました。")] });
	}
}
