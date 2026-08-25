/**
 * フレームワーク自体の設定 — 「フレームワークの設定はどこで変えるのか」の
 * 答えがこのファイルです。
 *
 * ここに書けるのは `ClientOptions` の項目です。この Bot が実際に指定して
 * いるのは `intents` と `applicationGuildIds` だけですが、同じ場所に
 * 次のものも置けます(いずれも既定のままにしてあるので、あえて書いて
 * いません):
 *
 * - `logger` — 採用する pino インスタンス、または pino に渡すオプション。
 * - `defaultPrefix` — メッセージ(プレフィックス)コマンドを有効にする。
 * - `fetchPrefix` — メッセージ毎にプレフィックスを解決する(ギルド毎など)。
 * - `syncApplicationCommands` — ready 時のスラッシュコマンド一括登録。
 * - `baseDirectory` — コンポーネント自動探索のルート。
 *
 * `baseDirectory` の既定は **エントリファイル(`src/index.ts`)のある
 * ディレクトリ** です。エントリを動かすと、エラーも出さずに全ストアが
 * 空になるので動かさないでください。
 *
 * 機能ごとの設定はこのファイルではなく `utils.ts` / `music.ts` / `ai.ts`
 * にあります。`intents` は設定ファイル間で合併(union)されるので、ここは
 * 「どの機能でも要る分」だけを持ちます。
 */
import { defineConfig, definePlugin, GatewayIntentBits } from "@cc-discord-framework/core";
import { env } from "./_env.js";

export default defineConfig({
	// 警告を真っ先に出すため、他のどの層よりも先にインストールします。
	priority: 1000,

	intents: [GatewayIntentBits.Guilds],
	// 開発中はギルド登録(即時反映)。未設定ならグローバル登録。
	applicationGuildIds: env.devGuildIds,

	plugins: [
		// 環境変数の警告はここでまとめて出します。設定ファイルのうちこの1枚は
		// 必ず残るので、機能ファイル(ai.ts など)を消しても警告は消えません。
		// console ではなくクライアントのロガーへ流すのは、本番のログが
		// NDJSON だからです — 素の console.warn を混ぜると行が壊れます。
		definePlugin({
			name: "env-warnings",
			install(client) {
				for (const warning of env.warnings) {
					client.logger.warn({ scope: "config" }, warning);
				}
			},
		}),
	],
});
