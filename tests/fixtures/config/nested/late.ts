import { defineConfig } from "../../../../src/index.js";
import { markerPlugin } from "../../marker-plugin.js";

// サブディレクトリも読み込まれる。priority が同じならパスの昇順なので、
// このファイルは a-base.ts / b-extra.ts より後になる。
export default defineConfig({
	plugins: [markerPlugin("nested")],
});
