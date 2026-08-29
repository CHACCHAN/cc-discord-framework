import { defineContainerValue } from "../../../../src/index.js";

export default defineContainerValue({
	name: "renamed",
	create: async (container) => {
		await Promise.resolve();
		return { hasClient: container.client !== undefined };
	},
});
