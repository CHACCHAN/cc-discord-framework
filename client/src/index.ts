/**
 * エントリポイント。設定は `./config/` にあります。
 *
 * `config/client.ts` がフレームワーク自体の設定、`config/utils.ts` /
 * `config/music.ts` / `config/ai.ts` が機能ごとの設定、`config/_env.ts` が
 * 環境変数の読み出しです。`createClient()` がそれらを読んで1つの設定に
 * まとめるので、このファイルには何も書きません。
 *
 * コマンド・リスナー・Precondition・サービス・タスク・AI ツールは、これまで
 * 通り `src/` の各ディレクトリにクラスを置くだけで自動ロードされます
 * (`config` という名前のコンポーネント種別は無いので、`src/config/` が
 * 自動探索に拾われることはありません)。
 *
 * プラグインが提供するのは **コンポーネント種別の自動ロード**・
 * **サービス**(`this.services.audio` / `this.services.ai` / `this.services.ui`)・
 * **イベント** だけです。スラッシュコマンドは Bot の機能なので、
 * `src/commands/` に自分で置いています。数が増えたので
 * `commands/music/` `commands/ai/` `commands/system/` に束ねていますが、
 * サブディレクトリは探索されるだけで、コマンド名には影響しません。
 *
 * **このファイルは `src/index.ts` から動かさないでください。** 自動探索の
 * ルート(`baseDirectory`)も設定ディレクトリ(`src/config/`)も、既定では
 * エントリファイルの場所(`dirname(Bun.main)`)から決まります。エントリを
 * 動かすと、エラーも出さずに全ストアが空になります。
 */
import { createClient } from "@cc-discord-framework/core";

const client = await createClient();

export default client;

// トークンは DISCORD_TOKEN 環境変数(.env)から自動で使われる。
if (import.meta.main) await client.login();
