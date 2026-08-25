import { Command } from "../../../../src/index.js";

@Command.define({ description: "Pong!" })
export class PingCommand extends Command {
	override async chatInputRun() {}
}

// Non-component exports must be ignored by discovery.
export const HELPER_VALUE = 42;
export function helper() {}
