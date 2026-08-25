import { NotPlayingError } from "@cc-discord-framework/music";
import { formatDuration, progressBar } from "@cc-discord-framework/utils";
import { Command, type ChatInputCommandInteraction } from "@cc-discord-framework/core";
import { LOOP_LABELS, NOTHING_PLAYING, describeTrack, requireQueue } from "./_shared.js";

// クラス名からの既定は "now-playing" だが、打ちやすさを優先して "nowplaying" にする。
@Command.define({ name: "nowplaying", description: "再生中の曲を表示します。" })
export class NowPlayingCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const queue = requireQueue(this.services.audio, interaction);
		const track = queue.current;
		if (!track) throw new NotPlayingError(NOTHING_PLAYING);

		const elapsed = queue.playbackDuration;
		// 長さが判っているときだけ進捗バーを描ける(ラジオなどは不定)。
		const total = track.duration !== null && track.duration > 0 ? track.duration : null;
		const progress =
			total === null
				? `${formatDuration(elapsed)} / ライブ配信`
				: `${formatDuration(elapsed)} ${progressBar(elapsed, total)} ${formatDuration(total)}`;

		const lines = [
			describeTrack(track),
			progress,
			...(queue.paused ? ["⏸️ 一時停止中"] : []),
			...(queue.loop === "off" ? [] : [`🔁 ループ: ${LOOP_LABELS[queue.loop]}`]),
			`🔊 音量: ${Math.round(queue.volume * 100)}%・待機: ${queue.tracks.length}曲`,
			...(track.requestedBy === null ? [] : [`リクエスト: <@${track.requestedBy}>`]),
		];

		await interaction.reply({
			embeds: [this.services.ui.info(lines.join("\n")).setTitle("再生中")],
			// 題名やリクエスト者の表示でメンションを飛ばさない。
			allowedMentions: { parse: [] },
		});
	}
}
