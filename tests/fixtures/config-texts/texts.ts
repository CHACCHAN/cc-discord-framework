import { defineConfig, GatewayIntentBits } from "../../../src/index.js";

// texts は ClientOptions の通常のキーなので、後勝ちの合成規則にそのまま乗る。
export default defineConfig({
	intents: [GatewayIntentBits.Guilds],
	baseDirectory: null,
	logger: { level: "silent" },
	texts: { guildOnly: "サーバー限定のコマンドです。" },
});
