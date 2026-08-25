---
sidebar_position: 3
title: リファレンス Bot
---

# リファレンス Bot(`client/`)

フレームワークの [GitHub リポジトリ](https://github.com/CHACCHAN/cc-discord-framework)
には、**実際に運用できる音楽 + AI Bot** が `client/` として同梱されて
います。フレームワークの各コンポーネント種別を一通り含む、いちばん
まとまったサンプルです。

この Bot が import するのは `@cc-discord-framework/core` と公式プラグイン
だけ — discord.js を直接 import する箇所はありません。

**Bot の機能はすべてここで明示的に書かれています。** プラグインが提供
するのは「自動ロードの仕組み」「サービス(メソッド群)」「イベント」
だけで、コマンドを勝手に生やすことはありません。

## 構成

```
client/
└── src/
    ├── index.ts                      エントリポイント: createClient + login
    ├── check.ts                      オフライン起動チェック(bun run check)
    ├── config/                       設定ディレクトリ(createClient が読む)
    │   ├── _env.ts                   環境変数の読み出しと検証(_ 始まりは設定として読まれない)
    │   ├── client.ts                 priority 1000 — intents・開発ギルド・環境変数警告の出力
    │   ├── utils.ts                  priority 100 — テーマと this.services.ui の土台
    │   ├── music.ts                  priority 50 — music + music-sources、GuildVoiceStates
    │   └── ai.ts                     priority は既定の 0 — ai
    ├── commands/                     Bot の機能はすべてここに明示的に書く
    │   ├── music/
    │   │   ├── _shared.ts            音楽コマンドの共通処理(_ 始まりは自動探索されない)
    │   │   ├── Play / Pause / Resume / Skip / Stop
    │   │   └── Queue / NowPlaying / Volume / Loop / Shuffle / Remove
    │   ├── ai/                       Ask / Chat / Forget(reply() を呼ぶだけ)
    │   └── system/                   Ping / Help / Shutdown
    ├── listeners/
    │   ├── MusicErrorListener.ts     musicError を受けて表示する
    │   └── ReadyListener.ts
    ├── services/ConfigService.ts     config/_env.ts の値 → this.services.config
    ├── preconditions/OwnerOnlyPrecondition.ts
    ├── tasks/PresenceTask.ts         公式 Utils プラグインの Task(定期実行)
    └── ai/NowPlayingTool.ts          AI へ自作機能を開放する例
```

`config/` は `src/` の中、**エントリファイル(`src/index.ts`)と同じ
階層**にあります。これが[設定ディレクトリ](../guides/config-directory.md)
の既定の場所です。`commands/` の下は `music/` `ai/` `system/` に分けて
いますが、**サブディレクトリは整理のためだけで、コンポーネント名には
影響しません** — `commands/music/PlayCommand.ts` のコマンド名はクラス名
から決まる `play` のままです
([プロジェクト構成](../getting-started/project-structure.md))。

**コマンド1つあたり 8〜49 行**です。短く書けるのはプラグインが
`this.services.audio` / `this.services.ai` を提供しているからで、
そこがプラグインの価値そのものです。

## 設定は `config/` にある

エントリポイントには、設定が1つも書かれていません:

```ts title="src/index.ts"
import { createClient } from "@cc-discord-framework/core";

const client = await createClient();

export default client;

// トークンは DISCORD_TOKEN 環境変数(.env)から自動で使われる。
if (import.meta.main) await client.login();
```

`createClient()` が `config/` の4枚(`_env.ts` を除く)を `priority` の
降順 → パスの昇順で読み、`plugins` を連結し、`intents` を合併して、1つの
`ClientOptions` にまとめます:

- `config/client.ts` — `priority: 1000`。どの機能でも要る
  `GatewayIntentBits.Guilds`、開発ギルドへの `applicationGuildIds`、
  そして環境変数の警告を起動ログへ流す小さなインラインプラグイン。
- `config/utils.ts` — `priority: 100` で `utils()` だけを入れます。
  テーマと `this.services.ui` という土台を用意する層なので、機能の層
  (music・ai)より先です。
- `config/music.ts` — `priority: 50`。`music()` + `musicSources()` と、
  音楽再生のためだけに要る `GuildVoiceStates`。
- `config/ai.ts` — `priority` を書かないので既定の 0、つまり最後です。
  `src/ai/` のツールが `this.services.audio` を参照するため、音楽より
  後に入れています。

この構成が、設定を分ける意味をいちばんよく表しています。
**`GuildVoiceStates` は音楽再生のためだけに要る intent なので、共通の
`client.ts` ではなく音楽の設定の隣にあります。** `intents` は合併される
のでクライアントに渡るのは `Guilds | GuildVoiceStates` で、音楽をやめる
ときは `config/music.ts` を消すだけで、要らなくなった intent も一緒に
消えます。

## 環境変数は1ファイルに集まっている

`config/_env.ts` は `_` 始まりなので設定としては読み込まれません。
**この Bot で環境変数を読むのはこの1ファイルだけ**で、他の設定ファイルは
ここが用意した型のついた値を受け取ります。読み出しはフレームワークの
[`createEnv()`](../guides/environment.md) に任せています — 解釈できない
値は例外にならず `reader.warnings` に積まれ、`config/client.ts` の
インラインプラグインが起動時にログへ流します。任意機能の設定ミスで
Bot 全体を落とさないためです。

`DISCORD_TOKEN` が `_env.ts` に無いのは、cc-discord-framework の
`Client.login()` が、引数を省略したときに `Bun.env.DISCORD_TOKEN` を
読むからです。

## 起動すると何がロードされるか

```
services: ui, audio, ai, config
commands: ask, chat, forget, loop, nowplaying, pause, play, queue, remove, resume, shuffle, skip, stop, volume, help, ping, shutdown
listeners: music-voice-state, music-error, ready
preconditions: OwnerOnly
tasks: presence
resolvers: url, archive, youtube, soundcloud
providers: http, youtube, soundcloud
ai: now-playing
```

コマンドの並びがディレクトリごとに固まっているのは、自動探索がパスを
ソートしてから読み込むためです(`commands/ai/` → `commands/music/` →
`commands/system/`)。サービスの並び(`ui` → `audio` → `ai` → `config`)
は、プラグインのインストール順 — つまり `config/` の `priority` —
そのままです。最後の `config` だけはプラグイン由来ではなく、
`src/services/` から自動探索されたものです。

## プラグインをまたいで組み合わせる

`ai/NowPlayingTool.ts` が、このサンプルでいちばん面白い部分です。
**ai プラグインの種別に置いたクラスから、music プラグインのサービスを
そのまま呼んでいます:**

```ts title="src/ai/NowPlayingTool.ts(抜粋)"
@AiTool.define({ description: "再生中の曲と待機中の曲の状況を返します。", inputSchema: input })
export class NowPlayingTool extends AiTool<z.infer<typeof input>> {
  override execute(args, context) {
    const queue = this.services.audio.queue(context.guildId);   // ← music のサービス
    // ...
  }
}
```

`/chat` で「いま何の曲?」と聞くと、モデルがこのツールを呼びます。
プラグイン同士は互いを知りませんが、**サービスの収束
(`this.services.*`)だけで繋がります**。

## 各ファイルが示すもの

| 見どころ | 場所 |
| --- | --- |
| Bot の機能は明示的に書く | `commands/` の17ファイル(`music/` `ai/` `system/` に整理) |
| サービスで短く書ける | `AskCommand` は `reply()` 1回・`PauseCommand` は14行 |
| イベントを受けて表示する | `listeners/MusicErrorListener.ts` |
| ファイル自動探索(規約 = 構造) | ディレクトリ構成そのもの |
| サービス収束(import 不要) | `OwnerOnlyPrecondition` の `this.services.config` |
| Precondition と型安全な名前 | `ShutdownCommand` + `OwnerOnlyPrecondition` |
| 公式プラグインの種別追加 | `tasks/PresenceTask.ts`(Utils プラグイン) |
| プラグインの重ね合わせ | `music()` の種別へ `musicSources()` が音源を足す |
| プラグインをまたぐ連携 | `ai/NowPlayingTool.ts` が `this.services.audio` を呼ぶ |
| 構造化ロギング | `ReadyListener` の `this.logger` |
| 設定を関心ごとに分ける | `config/` の4ファイル + `_env.ts` |
| 環境変数の型付き読み出し | `config/_env.ts` の `createEnv()`(警告は `client.ts` がログへ) |

## 動かす

リポジトリを取得して、`client/` で起動します:

```sh
git clone https://github.com/CHACCHAN/cc-discord-framework.git
cd cc-discord-framework
bun install

cd client
cp .env.example .env       # DISCORD_TOKEN(と OWNER_IDS, DEV_GUILD_IDS)を記入
bun run start              # 本番スタイル: NDJSON ログ
bun run dev                # pino-pretty 経由の読みやすいログ
```

必要なゲートウェイインテントは `Guilds` と `GuildVoiceStates` の2つです
(特権インテントは不要)。

音源を再生するには外部ツールが要ります:

| 音源 | 必要なもの |
| --- | --- |
| YouTube | **yt-dlp**(opus をそのまま渡すので ffmpeg は不要) |
| SoundCloud | **ffmpeg** |

どちらも見つからない場合は起動時に警告が出るだけで、Bot 自体は動きます。

AI を使うには、モデルと、そのプロバイダーのパッケージが要ります:

```sh
bun add @ai-sdk/google        # 無料枠あり・おすすめ
# .env に AI_MODEL=google:gemini-2.5-flash と GOOGLE_GENERATIVE_AI_API_KEY
```

**`AI_MODEL` が未設定でも Bot は普通に起動します。** その場合 `/ask` と
`/chat` だけが「モデルを設定してください」と答え、他の機能には影響
しません。

## オフライン起動チェック

```sh
bun run check
```

`check.ts` は `index.ts` からクライアントをそのまま import し
(`import.meta.main` により login はされません)、`client.load()` を
実行します — `config/` の読み込みとその合成、プラグインのインストール、
全コンポーネントのロード、ディスパッチャの接続までを、トークンも
ネットワークもなしで検証できます。自分の Bot でも同じ形の起動チェックが
作れます([コンポーネント](./components.md))。

## 見た目を変える

**コマンドの応答文言は `src/commands/` の各ファイルを直接編集して
ください。** 自分のコードなので、設定機構を経由する必要はありません。

プラグイン側にあるのは「エンジンのふるまい」だけで、その設定は `config/`
の**その機能の名前のファイル**にあります(各オプションの詳細は
プラグインのドキュメントを参照してください):

```ts
// config/utils.ts — 埋め込みの色
plugins: [utils({ theme: { colors: { success: 0x00ffaa } } })],

// config/music.ts — 音量の上限
plugins: [music({ limits: { maxVolume: 1.5 } }), musicSources({ /* ... */ })],

// config/ai.ts — 口調
plugins: [ai({ instructions: "あなたはこのサーバーの案内役です。" })],
```
