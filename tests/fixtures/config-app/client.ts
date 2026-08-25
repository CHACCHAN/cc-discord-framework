import { join } from "node:path";
import { defineConfig, GatewayIntentBits } from "../../../src/index.js";
import { markerPlugin } from "../marker-plugin.js";

// 設定は config-app/ から、コンポーネントは baseDirectory から探索される
// — この2つは独立している。
export default defineConfig({
	intents: [GatewayIntentBits.Guilds],
	baseDirectory: join(import.meta.dir, "..", "bot"),
	defaultPrefix: "!",
	logger: { level: "silent" },
	plugins: [markerPlugin("app-last")],
});
