import {
	ApplicationCommandOptionType,
	Command,
	type ChatInputCommandInteraction,
} from "cc-discord-framework";
import { requireQueue } from "./_shared.js";

/**
 * 指定できる音量の上限(パーセント)。
 * 再生エンジン側も `music({ limits: { maxVolume } })`(既定 2 = 200%)で
 * クランプするので、ここを上げる場合はそちらも合わせてください。
 */
const MAX_VOLUME_PERCENT = 200;

@Command.define({
	description: "音量を確認・変更します。",
	options: [
		{
			type: ApplicationCommandOptionType.Integer,
			name: "percent",
			description: `音量(0〜${MAX_VOLUME_PERCENT}%、省略すると現在値を表示)`,
			required: false,
			min_value: 0,
			max_value: MAX_VOLUME_PERCENT,
		},
	],
})
export class VolumeCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const queue = requireQueue(this.services.audio, interaction);
		const percent = interaction.options.getInteger("percent");

		if (percent === null) {
			const current = Math.round(queue.volume * 100);
			await interaction.reply({
				embeds: [this.services.ui.info(`🔊 現在の音量は ${current}% です。`)],
			});
			return;
		}

		queue.volume = percent / 100;
		// クランプ後の実値を返す(入力値をそのまま返すと嘘になることがある)。
		const applied = Math.round(queue.volume * 100);
		await interaction.reply({
			embeds: [this.services.ui.success(`🔊 音量を ${applied}% にしました。`)],
		});
	}
}
