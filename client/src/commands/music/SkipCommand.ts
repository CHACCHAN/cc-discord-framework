import {
	ApplicationCommandOptionType,
	Command,
	type ChatInputCommandInteraction,
} from "cc-discord-framework";
import { MusicError } from "@cc-discord-framework/music";
import { describeTrack, requireQueue } from "./_shared.js";

/** まとめてスキップできる曲数の上限(この Bot が決めている値)。 */
const MAX_SKIP_COUNT = 10;

@Command.define({
	description: "再生中の曲をスキップします。",
	options: [
		{
			type: ApplicationCommandOptionType.Integer,
			name: "count",
			description: `まとめてスキップする曲数(1〜${MAX_SKIP_COUNT}、既定は1)`,
			required: false,
			min_value: 1,
			max_value: MAX_SKIP_COUNT,
		},
	],
})
export class SkipCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const queue = requireQueue(this.services.audio, interaction);
		const count = interaction.options.getInteger("count") ?? 1;

		// skip() の後は current が入れ替わるので、先に控えておく。
		const skipped = queue.current;
		// 指定より残りが少なければ、あるだけしか飛ばせない。
		// 実際に飛ばした数(戻り値)を表示する — 指定数のまま表示すると嘘になる。
		const actual = queue.skip(count);

		// 再生終了後〜自動退出までの待ち時間は「キューはあるが何も無い」。
		// その間の /skip は何もしていないので、成功と言わない。
		if (actual === 0) {
			throw new MusicError("スキップできる曲がありません(再生が終わっています)。");
		}

		const from = skipped ? describeTrack(skipped) : "再生中の曲";
		const message =
			actual > 1 ? `⏭️ ${from} から${actual}曲スキップしました。` : `⏭️ ${from} をスキップしました。`;
		await interaction.reply({ embeds: [this.services.ui.success(message)] });
	}
}
