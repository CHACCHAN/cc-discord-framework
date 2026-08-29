import {
	ApplicationCommandOptionType,
	Command,
	type ChatInputCommandInteraction,
} from "@cc-discord-framework/core";

/**
 * 一問一答。履歴キーを渡さないので、前の話には引きずられません。
 * 続きのある会話をしたいときは `/chat` を使ってください。
 */
@Command.define({
	description: "AIに質問します(会話履歴は使いません)。",
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: "prompt",
			description: "聞きたいこと",
			required: true,
		},
	],
})
export class AskCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		// defer・ストリーミング表示・長文の分割・失敗時の表示は reply() の担当。
		// 見た目を変えたい場合は display(embeds / decorate / payload など)と
		// texts(answerBody など)を呼び出し単位で上書きできる。
		await this.services.ai.reply(interaction, {
			prompt: interaction.options.getString("prompt", true),
		});
	}
}
