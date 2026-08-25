# @cc-discord-framework/music-sources

cc-discord-framework 公式プラグイン — **YouTube と SoundCloud** を
[`@cc-discord-framework/music`](../music/) の音源として追加します。

> [!IMPORTANT]
> この v2 プラグインはまだ npm 未公開です。次の `bun add` は公開後の手順です。
> 現在はリポジトリを clone してルートで `bun install` し、[`client/`](../../client/) の
> `workspace:*` 構成を実例として使ってください。

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
    musicSources(),          // music() より後に置く
  ],
});
```

これだけで `/play lofi hip hop` も `/play https://youtu.be/...` も
`/play https://soundcloud.com/...` も動きます。

## なぜ別パッケージなのか

`music` 本体は **壊れない音源** だけを同梱しています(直リンク・Icecast
ラジオ・Internet Archive・ローカルファイル)。YouTube と SoundCloud は
各サービスの都合で定期的に壊れる層なので、独立したパッケージに分けて
あります。

壊れたときに更新するのはこのパッケージ(と yt-dlp)だけで、キュー・
再生制御・コマンドといった資産には影響しません。

## 必要なもの

| 音源 | 外部依存 | 理由 |
| --- | --- | --- |
| YouTube | **yt-dlp** | 再生 URL の取得。opus をそのまま渡すので **ffmpeg は不要** |
| SoundCloud | **ffmpeg** | SoundCloud は HLS(AAC)でしか配信していないため変換が必要 |

```sh
# yt-dlp(最新を使うこと。古いと YouTube 側の対策で動かなくなります)
sudo curl -fsSL -o /usr/local/bin/yt-dlp \
  https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux
sudo chmod +x /usr/local/bin/yt-dlp

# ffmpeg
sudo apt install ffmpeg
```

どちらも見つからない場合は起動時に警告が出ます(その音源だけが使えず、
Bot 自体は動きます)。

## なぜ YouTube に yt-dlp を使うのか

2026-08 時点で、YouTube は InnerTube のどのクライアント(WEB / ANDROID /
IOS / TV / MWEB / YTMUSIC)に対しても **再生 URL を返しません**。
`streaming_data` のフォーマットに `url` も `signature_cipher` も入らない
状態です(このリポジトリで実測して確認しています)。

一方 yt-dlp はこの手の対策への追随を専業で行っているプロジェクトです。
「外的要因で壊れる層は借りる」という方針どおり、**再生 URL の取得だけ**を
yt-dlp に任せ、検索とメタデータは youtubei.js から取っています
(こちらは制限がなく高速なため)。

youtubei.js が壊れた場合は自動的に yt-dlp のメタデータへ切り替わります。

## 設定

すべての項目に既定値があり、すべて上書きできます。

```ts
musicSources({
  search: "youtube",        // 素の検索語を誰が拾うか("youtube" | "soundcloud" | "none")

  youtube: {
    priority: 20,           // Resolver の優先度(大きいほど先に試される)
    metadata: "innertube",  // "innertube"(既定・高速) | "yt-dlp"
    searchLimit: 5,         // yt-dlp 経路でのみ有効(InnerTube は件数指定不可)
    playlistLimit: 100,
    cookies: "/path/cookies.txt",   // 年齢制限付き動画など
    userAgent: "cc-discord-framework-music-sources",
    ytdlp: {
      path: "yt-dlp",
      format: "bestaudio[acodec=opus]/bestaudio",
      commonArgs: ["--no-warnings", "--no-progress"],
      timeout: 30_000,      // これ以上かかったら kill して失敗にする(false で打ち切らない)
    },
  },

  soundcloud: {
    priority: 20,
    searchLimit: 5,
    playlistLimit: 100,
    clientId: Bun.env.SOUNDCLOUD_CLIENT_ID,  // 未指定なら自動抽出
    oauthToken: null,                        // Go+ 音質などに
    artworkSize: "t500x500",                 // サムネイルのサイズ(null で元のまま)
  },

  ffmpeg: {
    path: "ffmpeg",
    args: (input) => [...],   // 引数を丸ごと差し替えられる
  },
})
```

`youtube: false` / `soundcloud: false` で片方だけ使うこともできます。

設定はクライアントの `container.musicSourcesConfig` に置かれるため、
複数クライアントを立てても混ざりません。

### SoundCloud の client_id

未指定なら soundcloud.ts が SoundCloud の公開バンドルから自動抽出します。
これは数か月に一度失効することがあるので、安定させたい場合はブラウザの
開発者ツールで取得した値を `SOUNDCLOUD_CLIENT_ID` に入れてください。

## 追加されるコンポーネント

| 種別 | 名前 | 役割 |
| --- | --- | --- |
| Resolver | `youtube` | URL・プレイリスト・検索 → `Track` |
| Provider | `youtube` | yt-dlp から opus(webm)の直リンク |
| Resolver | `soundcloud` | URL・セット・検索 → `Track` |
| Provider | `soundcloud` | progressive か HLS を ffmpeg で PCM へ |

いずれも `music` の拡張点(`resolvers/` と `providers/`)だけで書かれて
います。自分で音源を足す場合の実装例としても読めます。

## 利用にあたって

どちらのサービスも公式 API ではない経路でアクセスします。各サービスの
利用規約を確認したうえで、自分の責任で使ってください。

## ライセンス

MIT
