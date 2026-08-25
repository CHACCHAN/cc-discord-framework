import { GatewayIntentBits } from "discord.js";
import { defineConfig } from "../../../src/index.js";

// NaN は typeof が "number" のままソートを黙って壊す。
export default defineConfig({
	priority: Number.NaN,
	intents: [GatewayIntentBits.Guilds],
});
