import { defineConfig, GatewayIntentBits, Partials } from "../../../src/index.js";
import { markerPlugin } from "../marker-plugin.js";

export default defineConfig({
	// Guilds / Message は a-base.ts と重複 — 合併で1つになる。
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
	partials: [Partials.Message, Partials.Channel],
	applicationGuildIds: ["100", "300"],
	plugins: [markerPlugin("extra")],
	syncApplicationCommands: false,
});
