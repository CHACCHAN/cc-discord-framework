/**
 * 環境変数の読み出しと検証。
 *
 * このクライアントで環境変数を読むのはこのファイルだけです。他の設定
 * ファイル(`client.ts` / `utils.ts` / `music.ts` / `ai.ts`)は、ここが
 * 用意した型のついた値を参照します。読む場所が1か所に寄っていれば、
 * どの環境変数が実際に使われているかは `.env.example` とこのファイルを
 * 突き合わせるだけで分かります。
 *
 * 読み方の定番(カンマ区切り・真偽値・空文字の扱い)はフレームワークの
 * `createEnv()` が持っています。解釈できない値は例外にならず
 * `reader.warnings` に積まれ、`client.ts` が起動時にログへ流します —
 * 任意機能の設定ミスで Bot 全体を落とさないためです。
 *
 * `DISCORD_TOKEN` はここにありません。トークンはフレームワークの
 * `Client.login()` が読むので、参照 Bot 側で触る必要がないからです。
 *
 * ファイル名が `_` で始まるものは設定ファイルとして読み込まれません
 * (コンポーネント探索と同じ規約)。共有のヘルパーはこうして `_` 付きの
 * ファイルに置きます。
 */
import { createEnv } from "cc-discord-framework";

const reader = createEnv();

// 値は warnings を写す前にすべて読み切ります。`flag()` は解釈できない値を
// 見た時点で reader.warnings に積むので、読み残しがあると警告が落ちます。
const ownerIds = reader.list("OWNER_IDS");
const devGuildIds = reader.list("DEV_GUILD_IDS");
const soundcloudClientId = reader.text("SOUNDCLOUD_CLIENT_ID");
const aiModel = reader.text("AI_MODEL");
const aiTools = reader.flag("AI_TOOLS", true);
const aiBaseUrl = reader.text("AI_BASE_URL");
const aiToken = reader.text("AI_TOKEN");

const warnings: string[] = [...reader.warnings];

// OpenAI 互換プロバイダーは接続先が分からないと呼べません。この組み合わせは
// 「動くつもりで動かない」設定なので、起動時に気づけるようにしておきます
// (ai プラグイン自身も気づきますが、それは最初の AI 呼び出しのときです)。
// /shutdown などの OwnerOnly コマンドは、許可リストが空だと誰も実行
// できない(安全側だが、気づかないと「壊れている」ように見える)。
if (ownerIds.length === 0) {
	warnings.push(
		"OWNER_IDS が空です。/shutdown などの OwnerOnly コマンドは誰も実行できません。",
	);
}

if (aiModel?.startsWith("compatible:") && aiBaseUrl === null) {
	warnings.push(
		'AI_MODEL が "compatible:…" ですが AI_BASE_URL が空です。' +
			"OpenAI 互換エンドポイントは接続先が必須なので、AI コマンドは" +
			"接続先未設定のエラーになります。",
	);
}

/** このクライアントが使う環境変数。 */
export const env = Object.freeze({
	/** `/shutdown` などを実行できるユーザー ID。`this.services.config` 経由で参照します。 */
	ownerIds,

	/** 開発用ギルド ID。設定するとスラッシュコマンドが即時反映されます。 */
	devGuildIds,

	/** SoundCloud の client_id。未設定なら音源側が自動抽出します。 */
	soundcloudClientId,

	/** AI の既定モデル(`"<プロバイダー>:<モデルID>"`)。未設定なら AI コマンドだけが断ります。 */
	aiModel,

	/** `src/ai/` のツールをモデルへ渡すか。既定は有効。 */
	aiTools,

	/** OpenAI 互換エンドポイントの接続先。 */
	aiBaseUrl,

	/** OpenAI 互換エンドポイントの認証トークン(`Authorization: Bearer`)。 */
	aiToken,

	/** 起動時に出す設定の警告(`config/client.ts` がログへ流します)。 */
	warnings: Object.freeze(warnings) as readonly string[],
});
