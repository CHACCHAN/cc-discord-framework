import { GatewayIntentBits } from "discord.js";

// クラスインスタンスの getter は Object.entries で拾えないため、
// 「intents を書いたのに無いと言われる」という黙った取りこぼしになる。
class ConfigBuilder {
	get intents() {
		return [GatewayIntentBits.Guilds];
	}
}

export default new ConfigBuilder();
