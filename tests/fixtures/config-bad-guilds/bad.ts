import { GatewayIntentBits } from "discord.js";
import { defineConfig } from "../../../src/index.js";

// applicationGuildIds を配列で包み忘れた例。文字列は iterable なので、
// 検査が無いと1文字ずつの「ギルドID」に砕けて黙って通ってしまう。
export default defineConfig({
	intents: [GatewayIntentBits.Guilds],
	applicationGuildIds: "123456789012345678" as never,
});
