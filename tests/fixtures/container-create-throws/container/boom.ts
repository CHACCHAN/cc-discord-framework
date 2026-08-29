import { defineContainerValue } from "../../../../src/index.js";

export default defineContainerValue({
	create: () => {
		throw new Error("create failed");
	},
});
