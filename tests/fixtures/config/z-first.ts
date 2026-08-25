import { defineConfig, GatewayIntentBits } from "../../../src/index.js";
import { markerPlugin } from "../marker-plugin.js";

// priority が大きいので、ファイル名は最後でも読み込みは最初になる。
export default defineConfig({
	priority: 10,
	// 配列以外の BitFieldResolvable も受け付ける。
	intents: GatewayIntentBits.MessageContent,
	plugins: [markerPlugin("first")],
});
