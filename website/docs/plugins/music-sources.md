---
sidebar_position: 4
---

# Music Sources

`@cc-discord-framework/music-sources` は、**YouTube と SoundCloud** を [Music](./music.md) プラグインの音源として追加します。導入すると `/play lofi hip hop`(検索語)も `/play https://youtu.be/...` も `/play https://soundcloud.com/...` も動くようになります。

| 種別 | 名前 | 役割 |
| --- | --- | --- |
| Resolver | `youtube` | URL・プレイリスト・検索 → `Track` |
| Provider | `youtube` | yt-dlp から opus(webm)の直リンク |
| Resolver | `soundcloud` | URL・セット・検索 → `Track` |
| Provider | `soundcloud` | progressive か HLS を ffmpeg で PCM へ |

### なぜ music 本体と分かれているのか

music 本体が同梱するのは **壊れない音源** だけです。YouTube と SoundCloud は各サービスの都合で定期的に壊れる層なので、独立したパッケージに分けてあります。壊れたときに更新するのはこのパッケージ(と yt-dlp)だけで、キュー・再生制御・自分で書いたコマンドといった資産には影響しません。

## インストール

:::warning[このパッケージはまだ npm 未公開です]

公式 v2 プラグインはリリース準備中です。次の `bun add` は**公開後の手順**で、
現時点の npm からはインストールできません。現在の実装を試す場合は
[リポジトリ](https://github.com/CHACCHAN/cc-discord-framework)を clone して
ルートで `bun install` し、モノレポ内の
[`client/`](https://github.com/CHACCHAN/cc-discord-framework/tree/main/client)
を構成例として使ってください。版全体の状況は
[プロジェクト状況](../framework/project-status.md)で確認できます。

:::

```sh
bun add @cc-discord-framework/music-sources
```

```ts
import { Client, GatewayIntentBits } from "cc-discord-framework";
import { music } from "@cc-discord-framework/music";
import { musicSources } from "@cc-discord-framework/music-sources";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  plugins: [
    music(),
    musicSources(),   // 必ず music() より後に置く
  ],
});
```

`musicSources()` は `music()` が追加した拡張点(`resolvers/`・`providers/`)へコンポーネントを登録するため、**`music()` より後** に並べる必要があります。

### 外部ツールの要件

| 音源 | 外部依存 | 理由 |
| --- | --- | --- |
| YouTube | **yt-dlp** | 再生 URL の取得。opus をそのまま渡すので ffmpeg は不要 |
| SoundCloud | **ffmpeg** | SoundCloud は HLS(AAC)でしか配信していないため変換が必要 |

```sh
# yt-dlp(最新を使うこと。古いと YouTube 側の対策で動かなくなります)
sudo curl -fsSL -o /usr/local/bin/yt-dlp \
  https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux
sudo chmod +x /usr/local/bin/yt-dlp

# ffmpeg
sudo apt install ffmpeg
```

見つからない場合は起動時に警告が出ます — その音源だけが使えず、Bot 自体は動きます。

### YouTube に yt-dlp を使う理由

2026-08 時点で、YouTube は InnerTube のどのクライアントに対しても再生 URL を返しません(このリポジトリで実測して確認されています)。そこで **検索とメタデータは youtubei.js**(制限がなく高速)、**再生 URL の取得だけ yt-dlp**(この手の対策への追随を専業で行っているプロジェクト)という分担にしています。youtubei.js が壊れた場合は、メタデータも自動的に yt-dlp へ切り替わります。

## 設定

すべての項目に既定値があり、すべて上書きできます。指定した項目だけが既定値を上書きします。

```ts
musicSources({
  search: "youtube",        // 素の検索語を誰が拾うか("youtube" | "soundcloud" | "none")

  youtube: {
    priority: 20,           // Resolver の優先度(大きいほど先に試される)
    metadata: "innertube",  // "innertube"(既定・高速) | "yt-dlp"
    searchLimit: 5,         // yt-dlp 経路でのみ有効(InnerTube は件数指定不可)
    playlistLimit: 100,     // プレイリストから取り込む最大曲数
    cookies: "/path/cookies.txt",   // yt-dlp に渡す cookies ファイル(年齢制限付き動画など)
    userAgent: "cc-discord-framework-music-sources",
    ytdlp: {
      path: "yt-dlp",       // 実行ファイル(PATH 上にあれば名前だけでよい)
      format: "bestaudio[acodec=opus]/bestaudio",
      commonArgs: ["--no-warnings", "--no-progress"],
      timeout: 30_000,      // これ以上かかったら kill して失敗にする(false で打ち切らない)
    },
  },

  soundcloud: {
    priority: 20,
    searchLimit: 5,
    playlistLimit: 100,
    clientId: Bun.env.SOUNDCLOUD_CLIENT_ID,  // 未指定なら自動抽出(下記)
    oauthToken: null,                        // Go+ 音質などに
    artworkSize: "t500x500",                 // サムネイルのサイズ(null で元のまま)
  },

  ffmpeg: {
    path: "ffmpeg",
    args: (input) => [/* 引数列を丸ごと差し替えられる */],
  },
})
```

`youtube: false` / `soundcloud: false` で片方だけ使うこともできます。設定はクライアントの `container.musicSourcesConfig` に置かれるため、複数クライアントを立てても混ざりません。

### `search` — 検索語のルーティング

URL でない入力(素の検索語)を誰が拾うかを決めます。既定は `"youtube"` です。`"soundcloud"` にすると検索語は SoundCloud へ、`"none"` にすると検索語からの再生は無効になります(URL は引き続き両方が拾います)。検索担当に指定した音源を `false` で無効化していると、起動時に警告が出ます。

### `ytdlp.timeout` — ハングした yt-dlp を打ち切る

yt-dlp の完了を既定 30 秒まで待ち、超えるとプロセスを kill してその曲を失敗にします。ハングした yt-dlp がギルドのキューを塞ぎ続けないための保険です。`false` で打ち切らずに待ち続けます。

### `cookies` — 年齢制限付き動画など

年齢制限付き動画などログインが必要なものを再生したい場合、ブラウザから書き出した cookies ファイルのパスを `youtube.cookies` に渡すと、yt-dlp がそれを使います。

### SoundCloud の `clientId`

未指定なら soundcloud.ts が SoundCloud の公開バンドルから自動抽出します。これは数か月に一度失効することがあるので、安定させたい場合はブラウザの開発者ツールで取得した値を環境変数(例: `SOUNDCLOUD_CLIENT_ID`)に入れて渡してください。Go+ 音質を使う場合は `oauthToken` も指定します。

## コード例

リポジトリの `client/src/config/music.ts` では、music と music-sources を1つの設定ファイルにまとめています。

```ts
// src/config/music.ts
import { defineConfig, GatewayIntentBits } from "cc-discord-framework";
import { music } from "@cc-discord-framework/music";
import { musicSources } from "@cc-discord-framework/music-sources";
import { env } from "./_env.js";

export default defineConfig({
  priority: 50,
  intents: [GatewayIntentBits.GuildVoiceStates],
  plugins: [
    music(),
    // music より後に置く。1つのファイルに並べたプラグインは配列順のまま入る。
    musicSources({
      soundcloud: { clientId: env.soundcloudClientId },
    }),
  ],
});
```

このプラグイン自身は新しいコマンドもサービスも増やしません。導入すると、[Music](./music.md) の `this.services.audio.play()` に渡した YouTube / SoundCloud の URL や検索語がそのまま解決されるようになります。

## 利用にあたって

どちらのサービスも **公式 API ではない経路** でアクセスします。各サービスの利用規約を確認したうえで、自分の責任で使ってください。music 本体に同梱せず別パッケージにしているのは、この判断を導入する人が明示的に行う形にするためでもあります。

## 互換性

| 項目 | 要件 |
| --- | --- |
| ランタイム | Bun 1.4+ |
| discord.js | v14 |
| フレームワーク | `cc-discord-framework` ^2.0.0(peer dependency) |
| プラグイン | `@cc-discord-framework/music`(peer dependency — 先にインストールしておく) |
| 外部ツール | YouTube に yt-dlp、SoundCloud に ffmpeg |
