import { Listener } from "../../../../src/index.js";

export const warnings: string[] = [];

@Listener.define({ event: "warn" })
export class WarnListener extends Listener<"warn"> {
	override run(message: string) {
		warnings.push(message);
	}
}
