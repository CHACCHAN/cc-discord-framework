import { Command, type ChatInputCommandInteraction } from "@cc-discord-framework/core";
import { requireQueue } from "./_shared.js";

@Command.define({ description: "再生を停止し、キューを空にして切断します。" })
export class StopCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const queue = requireQueue(this.services.audio, interaction);
		queue.stop();

		await interaction.reply({
			embeds: [this.services.ui.success("⏹️ 再生を停止して切断しました。")],
		});
	}
}
