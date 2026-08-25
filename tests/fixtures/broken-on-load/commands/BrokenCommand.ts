import { Command } from "../../../../src/index.js";

@Command.define({ description: "ロードに失敗するテスト用コマンド" })
export class BrokenCommand extends Command {
	override onLoad(): void {
		throw new Error("onLoad boom");
	}

	override async chatInputRun() {}
}
