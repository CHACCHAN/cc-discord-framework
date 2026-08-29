import { defineContainerValue } from "../../../../src/index.js";
import { log } from "./_log.js";

export default defineContainerValue({
	create: () => {
		log.push("create:aOk");
		return "a";
	},
	dispose: () => {
		log.push("dispose:aOk");
	},
});
