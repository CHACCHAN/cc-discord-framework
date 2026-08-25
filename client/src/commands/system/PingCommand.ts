import { Command, type ChatInputCommandInteraction } from "@cc-discord-framework/core";

@Command.define({ description: "Botの応答速度を確認します。" })
export class PingCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		await interaction.reply(`Pong! ${this.client.ws.ping}ms`);
	}
}
