import { MusicError } from "@cc-discord-framework/music";
import { Command, type ChatInputCommandInteraction } from "cc-discord-framework";
import { requireQueue } from "./_shared.js";

@Command.define({ description: "待機中の曲をシャッフルします。" })
export class ShuffleCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const queue = requireQueue(this.services.audio, interaction);
		if (queue.tracks.length < 2) {
			throw new MusicError("シャッフルするには待機中の曲が2曲以上必要です。");
		}

		queue.shuffle();
		await interaction.reply({
			embeds: [this.services.ui.success(`🔀 待機中の${queue.tracks.length}曲をシャッフルしました。`)],
		});
	}
}
