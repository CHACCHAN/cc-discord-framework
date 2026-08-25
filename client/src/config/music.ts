/**
 * 音楽再生 — キュー・再生制御(`this.services.audio`)と、その音源。
 *
 * このファイルの要点は、**音楽のために必要な intent が音楽の隣にある**
 * ことです。`GuildVoiceStates` は音楽再生のためだけに要る intent なので、
 * フレームワーク共通の `client.ts` ではなくここで宣言します。`intents` は
 * 設定ファイル間で合併(union)されるため、これで `client.ts` の
 * `Guilds` と足し合わされます。音楽をやめるときはこのファイルを消すだけで、
 * 要らなくなった intent も一緒に消えます。
 *
 * `priority: 50` は utils(100)より後、ai(既定の 0)より先という意味です。
 * ai 側のツール(`src/ai/`)が `this.services.audio` を参照するので、
 * 依存の向きに合わせて音楽を先に入れています。
 */
import { defineConfig, GatewayIntentBits } from "cc-discord-framework";
import { music } from "@cc-discord-framework/music";
import { musicSources } from "@cc-discord-framework/music-sources";
import { env } from "./_env.js";

export default defineConfig({
	priority: 50,
	intents: [
		// 音楽再生に必要(ボイスチャンネルの出入りを追うため)。
		GatewayIntentBits.GuildVoiceStates,
	],
	plugins: [
		// キュー・再生制御の this.services.audio(/play などは src/commands/)。
		music(),
		// YouTube と SoundCloud を音源として追加(music より後に置く。
		// 1つのファイルに並べたプラグインは、この配列順のまま入る)。
		musicSources({
			soundcloud: { clientId: env.soundcloudClientId },
		}),
	],
});
