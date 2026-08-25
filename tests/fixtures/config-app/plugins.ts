import { defineConfig } from "../../../src/index.js";
import { jobPlugin } from "../job-kind.js";
import { markerPlugin } from "../marker-plugin.js";

// priority が大きいので、ファイル名は client.ts の後でも先に読み込まれる。
export default defineConfig({
	priority: 5,
	plugins: [markerPlugin("app-first"), jobPlugin(), markerPlugin("app-second")],
});
