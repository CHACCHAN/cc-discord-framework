import { defineContainerValue } from "../../../../src/index.js";

// ファイル名から導出される名前("1bad")がプロパティ名として使えない。
export default defineContainerValue({
	create: () => "unreachable",
});
