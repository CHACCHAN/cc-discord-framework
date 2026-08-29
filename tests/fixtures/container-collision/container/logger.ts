import { defineContainerValue } from "../../../../src/index.js";

// コンテナの既存プロパティ(logger)と衝突する名前。
export default defineContainerValue({
	create: () => "should not load",
});
