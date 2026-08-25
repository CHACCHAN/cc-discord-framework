import { Client } from "@cc-discord-framework/core";
import { music, type MusicOptions } from "../src/index.js";

/** music プラグイン入りのオフラインクライアント。 */
export function createMusicClient(options: MusicOptions = {}) {
	return new Client({
		intents: [],
		baseDirectory: null,
		logger: { level: "silent" },
		plugins: [music(options)],
	});
}
