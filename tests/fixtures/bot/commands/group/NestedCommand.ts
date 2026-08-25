import { Command } from "../../../../../src/index.js";

/** サブディレクトリに置いても、名前はクラス名から導出される(`nested`)。 */
@Command.define({ description: "ネストされたコマンド" })
export class NestedCommand extends Command {
	override async chatInputRun() {}
}
