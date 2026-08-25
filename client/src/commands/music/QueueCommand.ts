import { chunk, paginate, type Page } from "@cc-discord-framework/utils";
import { Command, type ChatInputCommandInteraction } from "cc-discord-framework";
import { LOOP_LABELS, describeTrack, requireQueue } from "./_shared.js";

/** 1ページあたりの表示曲数(この Bot が決めている値)。 */
const PAGE_SIZE = 10;

@Command.define({ description: "再生キューを表示します。" })
export class QueueCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const queue = requireQueue(this.services.audio, interaction);
		const current = queue.current ? describeTrack(queue.current) : "なし";
		const total = queue.tracks.length;

		// 待機列が空でも「再生中」は見せたいので、1ページだけは必ず作る。
		const chunks = chunk(queue.tracks, PAGE_SIZE);
		const bodies =
			chunks.length === 0
				? ["(待機中の曲はありません)"]
				: chunks.map((tracks, page) =>
						tracks
							.map((track, offset) => `\`${page * PAGE_SIZE + offset + 1}.\` ${describeTrack(track)}`)
							.join("\n"),
					);

		const pages: Page[] = bodies.map((body, page) =>
			this.services.ui
				.info(`**▶️ 再生中**\n${current}\n\n**⏭️ 待機中**\n${body}`)
				.setTitle("再生キュー")
				.setFooter({
					text: `${page + 1}/${bodies.length}ページ・待機${total}曲・ループ: ${LOOP_LABELS[queue.loop]}`,
				}),
		);

		// ページが1つだけならボタンは付きません(paginate が判断します)。
		await paginate(interaction, { pages });
	}
}
