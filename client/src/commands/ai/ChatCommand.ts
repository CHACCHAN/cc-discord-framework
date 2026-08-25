import {
	ApplicationCommandOptionType,
	Command,
	type ChatInputCommandInteraction,
} from "cc-discord-framework";

/**
 * チャンネル単位の会話履歴を踏まえて答えます。
 * 履歴を消すには `/forget` を使ってください(キーも同じチャンネル ID)。
 */
@Command.define({
	description: "会話の流れを踏まえてAIと話します。",
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: "message",
			description: "伝えたいこと",
			required: true,
		},
	],
})
export class ChatCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		await this.services.ai.reply(interaction, {
			prompt: interaction.options.getString("message", true),
			// 履歴キーはチャンネル ID。同じチャンネルにいる全員で1つの会話を共有する。
			history: interaction.channelId,
		});
	}
}
