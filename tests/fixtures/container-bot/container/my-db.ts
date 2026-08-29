import { defineContainerValue } from "../../../../src/index.js";

export default defineContainerValue({
	create: () => ({ kind: "db" }),
});
