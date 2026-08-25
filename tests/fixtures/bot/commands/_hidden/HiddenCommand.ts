import { Command } from "../../../../../src/index.js";

/** `_` 始まりのディレクトリの中身は共有コード扱いでロードされない。 */
@Command.define({ description: "読まれてはいけない" })
export class HiddenCommand extends Command {
	override async chatInputRun() {}
}
