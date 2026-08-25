import { GatewayIntentBits } from "discord.js";
import { defineConfig } from "../../../../../src/index.js";

/** 既定の解決先(`<エントリのディレクトリ>/config`)に置いた設定。 */
export default defineConfig({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});
