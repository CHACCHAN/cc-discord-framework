import { Command } from "../../../../src/index.js";

// This file starts with "_": discovery must skip it entirely.
@Command.define({ description: "Should never load" })
export class SkippedCommand extends Command {
	override async chatInputRun() {}
}
