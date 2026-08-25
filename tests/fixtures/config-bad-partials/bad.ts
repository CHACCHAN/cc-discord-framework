import { GatewayIntentBits, Partials } from "discord.js";
import { defineConfig } from "../../../src/index.js";

// partials を配列で包み忘れた例(intents の単体表記と混同しやすい)。
export default defineConfig({
	intents: [GatewayIntentBits.Guilds],
	partials: Partials.Channel as never,
});
