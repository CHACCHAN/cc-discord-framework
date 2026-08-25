import { defineConfig, GatewayIntentBits, Partials } from "../../../src/index.js";
import { markerPlugin } from "../marker-plugin.js";
import { GUILD_IDS } from "./_env.js";

export default defineConfig({
	intents: [GatewayIntentBits.Guilds],
	partials: [Partials.Message],
	applicationGuildIds: GUILD_IDS,
	// 1つのファイル内に並べたプラグインは、この配列順を保つ。
	plugins: [markerPlugin("base-1"), markerPlugin("base-2")],
	defaultPrefix: "!",
	logger: { level: "silent" },
});
