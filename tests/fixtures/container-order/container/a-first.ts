import { defineContainerValue } from "../../../../src/index.js";
import { log } from "./_log.js";

export default defineContainerValue({
	create: () => {
		log.push("create:aFirst");
		return "a";
	},
	dispose: () => {
		log.push("dispose:aFirst");
	},
});
