import { Command, type ChatInputCommandInteraction } from "cc-discord-framework";

/** `/chat` が積んだ会話履歴を消します(キーは `/chat` と同じチャンネル ID)。 */
@Command.define({ description: "このチャンネルのAIとの会話履歴を消します。" })
export class ForgetCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const cleared = await this.services.ai.forget(interaction.channelId);

		// 消すものが無かった場合も、黙って成功にはしない。
		await interaction.reply({
			embeds: [
				cleared
					? this.services.ui.success("🧹 このチャンネルの会話履歴を消しました。")
					: this.services.ui.info("消す会話履歴はありませんでした。"),
			],
		});
	}
}
