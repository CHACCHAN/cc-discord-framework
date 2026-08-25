import {
	Command,
	MessageFlags,
	type ChatInputCommandInteraction,
} from "@cc-discord-framework/core";

@Command.define({
	description: "Botを安全にシャットダウンします。",
	preconditions: ["OwnerOnly"],
})
export class ShutdownCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		await interaction.reply({
			content: "シャットダウンします...",
			flags: MessageFlags.Ephemeral,
		});
		await this.client.destroy();
		process.exit(0);
	}
}
