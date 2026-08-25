import { Precondition } from "../../../../src/index.js";

export class OwnerOnlyPrecondition extends Precondition {
	override chatInputRun() {
		return this.ok();
	}
}
