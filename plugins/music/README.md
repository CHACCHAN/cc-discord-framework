# @cc-discord-framework/music

[cc-discord-framework](../../README.md) の公式音楽プラグイン。
キュー・再生制御と、**差し替え可能なプロバイダー機構**を提供します。

> [!IMPORTANT]
> この v2 プラグインはまだ npm 未公開です。パッケージ名を使った導入手順は
> 公開後のものです。現在はリポジトリを clone してルートで `bun install` し、
> [`client/`](../../client/) の `workspace:*` 構成を実例として使ってください。

```ts
import { Client, GatewayIntentBits } from "cc-discord-framework";
import { music } from "@cc-discord-framework/music";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  plugins: [music()],
});
```

## このプラグインはコマンドを登録しません

プラグインが提供するのは **再生エンジン** だけです。

| 提供するもの | 内容 |
| --- | --- |
| コンポーネント種別 | `resolvers/` と `providers/` の自動ロード |
| サービス | `this.services.audio`(解決・キュー・再生制御) |
| イベント | `musicTrackStart` / `musicTrackEnd` / `musicQueueEnd` / `musicDisconnect` / `musicError` |
| 設定 | 再生エンジンのふるまい(下記) |

`/play` などは **Bot の機能** なので、Bot 側(`client/src/commands/`)で
`this.services.audio` を使って書いてください。応答の文言も見せ方も、
そこで自由に決められます。

```ts
// client/src/commands/music/PlayCommand.ts
import { ApplicationCommandOptionType, Command } from "cc-discord-framework";
import type { ChatInputCommandInteraction, GuildMember } from "discord.js";

@Command.define({
  description: "URL または検索クエリから音楽を再生します。",
  options: [
    {
      name: "query",
      description: "URL または検索クエリ",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
})
export class PlayCommand extends Command {
  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const channel = (interaction.member as GuildMember).voice.channel;
    if (!channel) return interaction.reply("先にボイスチャンネルへ参加してください。");

    await interaction.deferReply();
    const { tracks, started } = await this.services.audio.play({
      channel,
      query: interaction.options.getString("query", true),
      requestedBy: interaction.user.id,
      textChannel: interaction.channel ?? undefined,
    });
    await interaction.editReply(
      started ? `▶ ${tracks[0]!.title}` : `キューに追加しました: ${tracks[0]!.title}`,
    );
  }
}
```

## 設計: Resolve と Stream を分ける

このプラグインは音源まわりを **2つのコンポーネント種別** に分けています。

| 種別 | ディレクトリ | 役割 |
| --- | --- | --- |
| `TrackResolver` | `resolvers/` | 入力(URL・検索語)→ トラック情報 |
| `StreamProvider` | `providers/` | トラック → 実際の音声ストリーム |

分ける理由は明確です。**音源サイトの仕様変更で壊れるのは常に Stream 側** で、
Resolve 側の資産(プレイリスト展開、メタデータ、ISRC など)は壊れません。
分離しておけば Provider を差し替えるだけで復旧できます。

この構造は Spotify のようなメタデータ専用ソースにも必要です。Spotify は
DRM により直接再生できないため、Resolver として曲情報だけを返し、実際の
音声は別の Provider が担当する、という形になります。

## 同梱プロバイダー

既定では **スクレイピングを伴わない音源のみ** を同梱しています。
これらは各サイトの利用規約に抵触せず、かつ **壊れることがありません**。

| 種別 | 名前 | 対象 |
| --- | --- | --- |
| Resolver | `url` | http(s) 直リンク・Icecast/Shoutcast ラジオ |
| Resolver | `archive` | Internet Archive(archive.org)のアイテム |
| Resolver | `local` | ローカルファイル(`localDirectories` 指定時のみ) |
| Provider | `http` | http(s) からの取得 |
| Provider | `local` | ローカルファイルの読み出し |

YouTube・SoundCloud は公式の
[`@cc-discord-framework/music-sources`](../music-sources/) を並べるだけで
追加できます(後述)。

## オプション

```ts
music({
  localDirectories: ["/srv/music"],      // ローカル再生を許可(既定 [] = 無効)
  defaultVolume: 1,                      // 既定音量(0〜limits.maxVolume)
  leaveOnEnd: 30_000,                    // キュー終了後の切断まで(false で切断しない)
  leaveOnEmpty: 30_000,                  // 無人チャンネルからの切断まで
})
```

`localDirectories` で指定したディレクトリの **外側へはシンボリックリンク
経由でもアクセスできません**。解決時に実パスを検証し、再生時にも symlink を
辿らず開いたファイルそのものを再検証します。

### エンジンの設定はすべて差し替えられます

ハードコードされて変えられない値はありません。指定した項目だけが既定値を
上書きします。

```ts
music({
  // エンジンが投げるエラーの文言(すべて差し替え可能)
  texts: {
    noResult: (query) => `「${query}」は見つかりませんでした。`,
    noProvider: (title) => `${title} を再生できるプロバイダーがありません。`,
    nothingPlaying: "いま何も鳴っていません。",
    accessDenied: "このファイルは読めません。",
    httpFailed: (status, title) => `${title} の取得に失敗しました(HTTP ${status})。`,
    privateAddressDenied: (host) => `${host} への接続は許可されていません。`,
    httpTimedOut: (title) => `${title} の取得がタイムアウトしました。`,
    tooManyRedirects: (title) => `${title} のリダイレクトが多すぎます。`,
    voiceChannelMismatch: "Botと同じボイスチャンネルから操作してください。",
    notAudio: (contentType) => `音声ではありません(${contentType})。`,
    streamFailed: (title) => `${title} のストリームを開けませんでした。`,
  },
  limits: {
    maxVolume: 2,               // 音量の上限
    historySize: 50,            // 履歴に残す曲数
    maxConsecutiveFailures: 10, // 連続失敗で諦めるまでの曲数
  },
  voice: {
    selfDeaf: true,            // 接続時に受信専用にする
    readyTimeout: 20_000,      // 接続完了を待つミリ秒
    reconnectTimeout: 5_000,   // 一時的な切断からの復帰を待つミリ秒
  },
  network: {
    userAgent: "cc-discord-framework-music",
    audioExtensions: ["mp3", "flac", "opus"],  // 音声として扱う拡張子
    requestTimeout: 15_000,       // 最終レスポンスヘッダーを待つ合計時間
    maxRedirects: 5,              // 追従するリダイレクト数
    privateHostAllowlist: [],      // 非公開アドレスを明示許可するホスト(完全一致)
  },
})
```

HTTP 音源は DNS で得た全アドレスを検査し、loopback、プライベート、
link-local など公開インターネットではない接続先を既定で拒否します。接続には
検査済み IP を使い、リダイレクト先も毎回同じ検査を行います。

LAN 内の Icecast などへ意図的に接続する場合だけ、
`privateHostAllowlist: ["radio.internal"]` のようにホスト名または IP アドレスを
完全一致で指定してください。リダイレクト先のホストは別途許可が必要です。

既定値は `defaultMusicTexts` / `defaultMusicConfig` として公開しています。
解決済みの設定は `musicConfigOf(interaction)` でも取り出せるので、Bot 側の
コマンドから `texts.nothingPlaying` などをそのまま使えます。

**コマンドの応答文言・埋め込みの有無・ページ送りの件数・進捗バーの見た目
などは、このプラグインの設定にはありません。**それらは Bot の機能なので、
Bot 側のコードで決めてください(長さの整形は
[`@cc-discord-framework/utils`](../utils/) の `formatDuration` /
`progressBar` が使えます)。

## API

```ts
// 再生(解決 → キュー追加 → 接続 → 再生開始 をまとめて行う)
const { queue, tracks, started } = await this.services.audio.play({
  channel: member.voice.channel,
  query: "https://example.com/song.opus",
  requestedBy: member.id,
  textChannel: interaction.channel,   // 通知先として記録するだけ(送信はしません)
  next: false,                        // キュー先頭へ割り込む
});

// サービス
this.services.audio.resolve(query, requestedBy);  // 解決だけ(キューに入れない)
this.services.audio.queue(guildId);               // 既存のキュー(なければ null)
this.services.audio.ensureQueue(guildId);         // 無ければ作る(接続はしない)
this.services.audio.queues;                       // 稼働中のすべてのキュー
this.services.audio.leave(guildId);               // 停止して切断

// キュー操作
const q = this.services.audio.queue(guildId);
q.add(track); q.insert(0, track); q.remove(2); q.move(0, 3);
q.shuffle(); q.clear();
q.skip(); q.pause(); q.resume(); q.stop();
await q.connect(voiceChannel); q.destroy();
q.loop = "off" | "track" | "queue";
q.volume = 0.5;

// 状態
q.current; q.tracks; q.history; q.playing; q.paused; q.playbackDuration;
q.voiceChannelId; q.destroyed; q.textChannel;
```

既存キューが別のボイスチャンネルへ接続中の場合、`play()` はその接続を
移動せず `MusicError` で拒否します。移動する場合は、既存キューを明示的に
破棄してから再生してください。

## イベント

`Listener` コンポーネントで型付きのまま観測できます。

```ts
@Listener.define({ event: "musicTrackStart" })
export class NowPlayingListener extends Listener<"musicTrackStart"> {
  override async run(queue: GuildQueue, track: Track) {
    await queue.textChannel?.send(`▶ ${track.title}`);
  }
}
```

`musicTrackStart` / `musicTrackEnd` / `musicQueueEnd` / `musicDisconnect` /
`musicError` が発火します。

### 再生失敗は `musicError` で受け取ります

プラグインは **イベントを発火するところまで** が仕事です。テキスト
チャンネルへ勝手にメッセージを送ることはありません。ユーザーへ見せたい
場合は Bot 側の `listeners/` に置いてください。

```ts
// client/src/listeners/MusicErrorListener.ts
@Listener.define({ event: "musicError" })
export class MusicErrorListener extends Listener<"musicError"> {
  override async run(error: unknown, queue: GuildQueue, track: Track | null) {
    const message = error instanceof Error ? error.message : String(error);
    await queue.textChannel?.send(`⚠ ${track?.title ?? "再生"}: ${message}`);
  }
}
```

エラーの文言(`texts.httpFailed` / `notAudio` / `streamFailed` /
`accessDenied` / `noProvider`)は `error.message` にそのまま入るので、
理由が失われることはありません。担当した Provider がすべて失敗した場合は、
**優先度がいちばん高い Provider の例外**が届きます — そのトラックに
いちばん詳しい音源の失敗理由が本当の原因で、後続の汎用フォールバックの
失敗(watch ページを開いて「音声ファイルではない」等)は雑音だからです。

## 音源を追加する

`resolvers/` と `providers/` にクラスを置くだけです。フレームワークが
自動でロードします。

### 例: 直接再生できるサイトを追加する

```ts
// resolvers/MySiteResolver.ts
import { TrackResolver, createTrack, type ResolveContext } from "@cc-discord-framework/music";

@TrackResolver.define({ priority: 10 })
export class MySiteResolver extends TrackResolver {
  override canResolve(query: string) {
    return query.startsWith("https://mysite.example/");
  }
  override async resolve({ query, requestedBy }: ResolveContext) {
    const info = await fetchInfo(query);
    return [createTrack({
      title: info.title,
      url: info.streamUrl,
      duration: info.durationMs,
      source: this.name,
      requestedBy,
    })];
  }
}
```

`url` が http(s) なら同梱の `http` Provider がそのまま再生します。
独自の取得処理が必要な場合だけ Provider も追加します。

### YouTube / SoundCloud に対応させる

公式の [`@cc-discord-framework/music-sources`](../music-sources/) を並べる
だけです。

```sh
bun add @cc-discord-framework/music-sources
```

```ts
import { musicSources } from "@cc-discord-framework/music-sources";

plugins: [music(), musicSources()],   // music より後
```

**本体に同梱していない理由**は、この2つが「壊れる層」だからです。各
サービスの仕様変更に追随して更新するのは音源パッケージだけで済み、
キュー・再生制御といった資産には影響しません。利用規約の判断も、導入した
人が明示的に行うことになります。

YouTube は yt-dlp、SoundCloud は ffmpeg が必要です。詳細は
[music-sources の README](../music-sources/README.md) を参照してください。

## ffmpeg について

音源が **opus を含む webm / ogg** を返す場合、変換も opus エンコードも
行われず、**ffmpeg は不要**でCPUもほぼゼロになります(`StreamType.WebmOpus`
または `OggOpus` を返してください)。

mp3・flac・wav などは変換が必要なため ffmpeg が要ります。見つからない場合は
起動時に警告が出ます。

## ランタイム

Bun 専用です。ネイティブモジュールは使いません
(opus は純JSの `opusscript`、暗号化は Bun 組み込みの `aes-256-gcm`)。

## ライセンス

MIT
