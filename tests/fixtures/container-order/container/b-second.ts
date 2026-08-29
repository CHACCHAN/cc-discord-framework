import { defineContainerValue } from "../../../../src/index.js";
import { log } from "./_log.js";

export default defineContainerValue({
	create: () => {
		log.push("create:bSecond");
		return "b";
	},
	dispose: () => {
		// 破棄の失敗が残りの破棄と destroy を止めないことの確認も兼ねる。
		log.push("dispose:bSecond");
		throw new Error("dispose failed");
	},
});
