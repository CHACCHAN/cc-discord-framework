---
sidebar_position: 1
---

# 公式プラグイン

cc-discord-framework の公式プラグインは、ドメインごとの独立したパッケージとして提供されます。重い依存はそのプラグインの中だけに閉じるので、使わない機能の依存を抱えることはありません。

| パッケージ | 何をするか | 追加する種別 | 依存 |
| --- | --- | --- | --- |
| [`@cc-discord-framework/utils`](./utils.md) | 定期実行・確認 UI・ページ送り・整形などの詰め合わせ | `Task`(`tasks/`) | なし |
| [`@cc-discord-framework/music`](./music.md) | キュー・再生制御と差し替え可能な音源機構 | `TrackResolver`(`resolvers/`)・`StreamProvider`(`providers/`) | `@discordjs/voice`・`opusscript` |
| [`@cc-discord-framework/music-sources`](./music-sources.md) | YouTube と SoundCloud を music の音源として追加 | (music の種別へ登録) | `youtubei.js`・`soundcloud.ts` + yt-dlp / ffmpeg |
| [`@cc-discord-framework/ai`](./ai.md) | 複数プロバイダー対応の AI 機能と `AiTool` | `AiTool`(`ai/`) | `ai`(Vercel AI SDK)・`zod`・utils |

:::info[npm 公開について]

プラグインパッケージは **まだ npm に公開されていません**。リリース後は `bun add @cc-discord-framework/utils` のように導入できるようになる予定です。それまでは、リポジトリの [`client/`](https://github.com/CHACCHAN/cc-discord-framework/tree/main/client) がモノレポ内の `workspace:*` 参照で使っている構成が実例です。以降の各ページの `bun add ...` はリリース後の手順として読んでください。

:::

## 入れ方

どのプラグインも `Client` の `plugins` 配列に並べるだけです。

```ts
import { Client, GatewayIntentBits } from "cc-discord-framework";
import { utils } from "@cc-discord-framework/utils";
import { music } from "@cc-discord-framework/music";
import { musicSources } from "@cc-discord-framework/music-sources";
import { ai } from "@cc-discord-framework/ai";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  plugins: [
    utils(),
    music(),
    musicSources(), // music() より後に置く
    ai({ model: "google:gemini-2.5-flash" }),
  ],
});
```

### `config/` ファイルに分ける書き方

機能ごとに設定ファイルを分けることもできます。`src/config/` に `defineConfig()` を置くと、`intents` はファイル間で合併(union)され、`plugins` は `priority`(大きいほど先、既定 0)の順にインストールされます。「音楽をやめるときは `music.ts` を消すだけで、要らなくなった intent も一緒に消える」という整理ができます。

```ts
// src/config/music.ts — 音楽のために必要な intent が音楽の隣にある
import { defineConfig, GatewayIntentBits } from "cc-discord-framework";
import { music } from "@cc-discord-framework/music";
import { musicSources } from "@cc-discord-framework/music-sources";

export default defineConfig({
  priority: 50, // utils(100)より後、ai(既定の 0)より先
  intents: [GatewayIntentBits.GuildVoiceStates],
  plugins: [music(), musicSources()],
});
```

### 順序の注意

`musicSources()` は `music()` が追加した拡張点(`resolvers/`・`providers/`)へコンポーネントを登録するので、**必ず `music()` より後** に並べてください。1つのファイルに並べたプラグインは配列順のまま入ります。ファイルを分けた場合は `priority` で順序を決めます(上の例では music が 50、ai は既定の 0 なので music が先です)。

## プラグインはコマンドを登録しません

これはこのフレームワークの設計方針です。公式プラグインが提供するのは **エンジン**(サービス・コンポーネント種別の自動ロード・イベント・設定)だけで、`/play` や `/ask` のようなスラッシュコマンドは登録しません。

コマンドは **Bot の機能** です。コマンド名・説明文・応答の文言・埋め込みの見せ方は Bot ごとに違うものなので、自分の `src/commands/` に書きます。プラグインのサービス(`this.services.audio` や `this.services.ai`)が重い部分を引き受けるため、コマンド本体は数行で済みます。各プラグインのページに、リポジトリの `client/src/` にある実際のコマンドを例として載せています。

コマンドの書き方そのものは[コマンドガイド](../framework/guides/commands.md)を参照してください。フレームワーク自体の導入は[インストール](../framework/getting-started/installation.md)からどうぞ。

## 互換性

すべての公式プラグインに共通です。

| 項目 | 要件 |
| --- | --- |
| ランタイム | Bun 1.4+(唯一のサポートランタイム) |
| discord.js | v14 |
| フレームワーク | `cc-discord-framework` ^2.0.0(peer dependency) |
