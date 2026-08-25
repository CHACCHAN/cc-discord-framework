import { chunk, paginate, type Page } from "@cc-discord-framework/utils";
import { Command, type ChatInputCommandInteraction } from "cc-discord-framework";

/** 1ページあたりの表示コマンド数(この Bot が決めている値)。 */
const PAGE_SIZE = 20;

/**
 * 各コマンドの説明(`@Command.define` の `description`)は commands ストアへ
 * 集まっているため、走査するだけで一覧が作れます。`src/commands/` の
 * どのサブディレクトリにファイルを足しても、ここへ手を入れずに一覧へ載ります
 * (サブディレクトリは整理のためだけで、コマンド名には影響しません)。
 *
 * `/queue` と同じくページ送りにしています — コマンドが増えても
 * 埋め込みの上限(4096文字)に当たりません。1ページに収まるうちは
 * ボタンは付きません(paginate が判断します)。
 */
@Command.define({ description: "コマンド一覧を表示します。" })
export class HelpCommand extends Command {
	override async chatInputRun(interaction: ChatInputCommandInteraction) {
		const lines = this.container.stores
			.get("commands")
			.map((command) => `**/${command.name}** — ${command.description}`)
			.sort();

		const pages: Page[] = chunk(lines, PAGE_SIZE).map((body, page, all) =>
			// utils プラグインの this.services.ui — 色は Bot 全体のテーマから。
			this.services.ui
				.info(body.join("\n"))
				.setTitle("コマンド一覧")
				.setFooter({ text: `${page + 1}/${all.length}ページ・全${lines.length}コマンド` }),
		);

		await paginate(interaction, { pages, ephemeral: true });
	}
}
