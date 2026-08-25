---
sidebar_position: 3
---

# Music

`@cc-discord-framework/music` は、キュー・再生制御と **差し替え可能な音源機構** を提供する音楽プラグインです。

| 提供するもの | 内容 |
| --- | --- |
| コンポーネント種別 | `resolvers/` と `providers/` の自動ロード |
| サービス | `this.services.audio`(解決・キュー・再生制御) |
| イベント | `musicTrackStart` / `musicTrackEnd` / `musicQueueEnd` / `musicDisconnect` / `musicError` |
| 設定 | 再生エンジンのふるまい(後述) |

このプラグインは **コマンドを登録しません**。提供するのは再生エンジンだけで、`/play` などは Bot の機能なので、自分の `src/commands/` で `this.services.audio` を使って書きます。応答の文言も見せ方も、そこで自由に決められます(このページ後半のコード例を参照してください)。

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
bun add @cc-discord-framework/music
```

ボイスチャンネルの出入りを追うため、`GuildVoiceStates` intent が必要です。

```ts
import { Client, GatewayIntentBits } from "cc-discord-framework";
import { music } from "@cc-discord-framework/music";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  plugins: [music()],
});
```

## 同梱音源

既定では **スクレイピングを伴わない音源のみ** を同梱しています。これらは各サイトの利用規約に抵触せず、かつ壊れることがありません。

| 種別 | 名前 | 対象 |
| --- | --- | --- |
| Resolver | `url` | http(s) 直リンク(S3 / R2 / 自前 VPS)・Icecast / Shoutcast ラジオ |
| Resolver | `archive` | Internet Archive(archive.org)のアイテム |
| Resolver | `local` | ローカルファイル(`localDirectories` 指定時のみ) |
| Provider | `http` | http(s) からの取得 |
| Provider | `local` | ローカルファイルの読み出し |

YouTube と SoundCloud は同梱していませんが、公式の [Music Sources](./music-sources.md) を並べるだけで追加できます。

ローカル再生は `localDirectories` を指定したときだけ有効になり、指定したディレクトリの **外側へはシンボリックリンク経由でもアクセスできません**。解決時に実パスを検証し、再生時にも symlink を辿らず開いたファイルそのものを再検証します。

## 設定

よく使う順に並べます。指定した項目だけが既定値を上書きし、ハードコードされて変えられない値はありません。

```ts
music({
  localDirectories: ["/srv/music"],  // ローカル再生を許可(既定 [] = 無効)
  defaultVolume: 1,                  // 既定音量(1 が原音、0〜limits.maxVolume)
  leaveOnEnd: 30_000,                // キュー終了後の切断までのミリ秒(false で切断しない)
  leaveOnEmpty: 30_000,              // 無人チャンネルからの切断までのミリ秒(false で切断しない)
})
```

### `texts` — エンジンが投げるエラーの文言

再生エンジンが投げるエラーの文言はすべて差し替えられます。この文言は `musicError` で届く `error.message` にそのまま入ります。

```ts
music({
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
})
```

### `limits` / `voice` / `network`

```ts
music({
  limits: {
    maxVolume: 2,               // 音量の上限
    historySize: 50,            // 履歴に残す曲数
    maxConsecutiveFailures: 10, // 連続失敗で諦めるまでの曲数
  },
  voice: {
    selfDeaf: true,            // 接続時に受信専用にする
    readyTimeout: 20_000,      // 接続完了を待つミリ秒
    reconnectTimeout: 5_000,   // 一時的な切断からの復帰を待つミリ秒
    // 聴き手(ボイス接続)がいない間の挙動。`@discordjs/voice` の
    // NoSubscriberBehavior を渡します。既定は Pause — 一時的な切断中に
    // 曲を消費してしまわないための値です。
    noSubscriberBehavior: NoSubscriberBehavior.Pause,
  },
  network: {
    userAgent: "cc-discord-framework-music",   // 外部リクエストの User-Agent
    // 音声として扱う拡張子。既定は mp3 / ogg / opus / oga / flac / wav /
    // m4a / aac / webm / weba / mp4 / mkv の12種(これは絞り込む例)。
    audioExtensions: ["mp3", "flac", "opus"],
    requestTimeout: 15_000,       // 最終レスポンスヘッダーを待つ合計時間
    maxRedirects: 5,              // 追従するリダイレクト数
    privateHostAllowlist: [],      // 非公開アドレスを明示許可するホスト(完全一致)
  },
})
```

HTTP 音源は、DNS で得た全アドレスを検査し、loopback、プライベート、link-local など公開インターネットではない接続先を既定で拒否します。接続には検査済み IP を使い、リダイレクト先も毎回同じ検査を行います。

LAN 内の Icecast などへ意図的に接続する場合だけ、`privateHostAllowlist: ["radio.internal"]` のようにホスト名または IP アドレスを完全一致で指定してください。リダイレクト先のホストは別途許可が必要です。

既定値は `defaultMusicTexts` / `defaultMusicConfig` として公開されています。解決済みの設定は `musicConfigOf(interaction)` で取り出せるので、Bot 側のコマンドから `texts.nothingPlaying` などをそのまま使えます。

なお、**コマンドの応答文言・埋め込みの有無・ページ送りの件数・進捗バーの見た目などは、このプラグインの設定にはありません**。それらは Bot の機能なので、Bot 側のコードで決めます(長さの整形は [utils](./utils.md) の `formatDuration` / `progressBar` が使えます)。

## 使い方

### `this.services.audio`

音楽再生のエントリポイントです。

```ts
// 再生(解決 → キュー追加 → 接続 → 再生開始 をまとめて行う)
const { queue, tracks, started } = await this.services.audio.play({
  channel: member.voice.channel,      // 接続先のボイスチャンネル
  query: "https://example.com/song.opus",  // URL または検索クエリ
  requestedBy: member.id,
  textChannel: interaction.channel,   // 通知先として記録するだけ(プラグインは送信しません)
  next: false,                        // true でキュー先頭へ割り込む
});

this.services.audio.resolve(query, requestedBy);  // 解決だけ(キューに入れない)
this.services.audio.queue(guildId);               // 既存のキュー(なければ null)
this.services.audio.ensureQueue(guildId);         // 無ければ作る(接続はしない)
this.services.audio.queues;                       // 稼働中のすべてのキュー
this.services.audio.leave(guildId);               // 停止して切断
```

`play()` の戻り値の `started` は「追加によって実際に再生が始まったか」です。`false` になるのは、既存の再生に追加された場合と、再生を試みたが音源を開けなかった場合(こちらは `musicError` で通知されます)です。

既存キューが別のボイスチャンネルへ接続中の場合、`play()` はその接続を移動せず `MusicError` で拒否します。移動する場合は、既存キューを明示的に破棄してから再生してください。

### `GuildQueue` の操作

```ts
const q = this.services.audio.queue(guildId);

// キュー操作
q.add(track); q.insert(0, track); q.remove(2); q.move(0, 3);
q.shuffle(); q.clear();

// 再生制御
q.skip();      // 戻り値は「実際にスキップした数」(下記)
q.pause(); q.resume();
q.stop();      // 再生を止め、キューを空にして切断
q.loop = "track";   // "off" | "track" | "queue"
q.volume = 0.5;     // 0〜limits.maxVolume(1 が原音)

// 状態
q.current; q.tracks; q.history; q.playing; q.paused; q.playbackDuration;
q.voiceChannelId; q.destroyed; q.textChannel;
```

`skip(count)` は `count` 曲まとめてスキップでき、**実際にスキップした数を返します**(再生中の1曲 + キューから外した数)。キューに残っている以上の `count` を渡しても、あるだけしか飛ばせません — **応答の表示にはこの戻り値を使ってください**。指定数のまま表示すると嘘になります。また、`skip()` 中は `loop: "track"` は無視されます(同じ曲が繰り返されません)。

### イベント

`Listener` コンポーネントで型付きのまま観測できます。

| イベント | 引数 | 発火するとき |
| --- | --- | --- |
| `musicTrackStart` | `(queue, track)` | 再生開始 |
| `musicTrackEnd` | `(queue, track)` | 再生終了(スキップ含む) |
| `musicQueueEnd` | `(queue)` | キューが空になった |
| `musicDisconnect` | `(queue)` | ボイス接続の切断 |
| `musicError` | `(error, queue, track)` | 再生中のエラー |

### 再生失敗は `musicError` で受け取ります

プラグインはイベントを発火するところまでが仕事で、テキストチャンネルへ勝手にメッセージを送りません。再生の失敗は `/play` の応答が返った **あと** に起きることもあるため、リスナーで拾わないとユーザーには「無言で次の曲へ進んだ」ようにしか見えません。リポジトリの `client/src/listeners/MusicErrorListener.ts` の実物です。

```ts
// src/listeners/MusicErrorListener.ts
import type { GuildQueue, Track } from "@cc-discord-framework/music";
import { Listener } from "cc-discord-framework";

@Listener.define({ event: "musicError" })
export class MusicErrorListener extends Listener<"musicError"> {
  override async run(error: unknown, queue: GuildQueue, track: Track | null) {
    const channel = queue.textChannel;
    // 通知先が判らない・送れない場合は、エンジン側のログだけで済ませる。
    if (!channel?.isSendable()) return;

    const reason = error instanceof Error ? error.message : String(error);
    const body = track === null ? reason : `「${track.title}」を再生できませんでした。\n${reason}`;

    await channel.send({
      embeds: [this.services.ui.error(body)],
      allowedMentions: { parse: [] },
    });
  }
}
```

通知先の `queue.textChannel` は、`/play` が `textChannel: interaction.channel` を渡していれば、コマンドを打ったチャンネルになります。エラーの文言(`texts.httpFailed` など)は `error.message` にそのまま入るので、理由が失われることはありません。担当した Provider がすべて失敗した場合は、**優先度がいちばん高い Provider の例外** が届きます — そのトラックにいちばん詳しい音源の失敗理由が本当の原因だからです。

## コード例: `/play` と `/skip`

リポジトリの `client/src/commands/music/` にある実物です。どちらも `_shared.ts` の小さなヘルパーを使っています — `/play` は `requirePlaybackVoiceChannel`(参加中のボイスチャンネルを要求し、既にキューが別チャンネルへ接続中なら横取りを断る)、`/skip` は `requireQueue`、表示の組み立ては共通の `describeTrack` です。`_` で始まるファイルはコンポーネントとして読み込まれないので、コマンド間の共有コードはこう置けます。

```ts
// src/commands/music/PlayCommand.ts
import {
  ApplicationCommandOptionType,
  Command,
  type ChatInputCommandInteraction,
} from "cc-discord-framework";
import { describeTrack, requirePlaybackVoiceChannel } from "./_shared.js";

@Command.define({
  description: "URLまたは検索語から曲を再生します。",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "query",
      description: "URL、または検索語",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      name: "next",
      description: "キューの先頭へ割り込む",
      required: false,
    },
  ],
})
export class PlayCommand extends Command {
  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const channel = requirePlaybackVoiceChannel(this.services.audio, interaction);
    // 解決も接続も時間がかかるので、先に defer しておく。
    await interaction.deferReply();

    const { tracks, started } = await this.services.audio.play({
      channel,
      query: interaction.options.getString("query", true),
      requestedBy: interaction.user.id,
      // musicError のリスナーが通知先として使う。
      textChannel: interaction.channel ?? undefined,
      next: interaction.options.getBoolean("next") ?? false,
    });

    const head = describeTrack(tracks[0]!);
    const summary = tracks.length > 1 ? `${head} ほか${tracks.length - 1}曲` : head;
    // started は「実際に鳴り始めたか」。鳴らなかった理由は musicError 側で伝わる。
    const message = started
      ? `▶️ 再生を開始します: ${summary}`
      : `➕ キューへ追加しました: ${summary}`;

    await interaction.editReply({ embeds: [this.services.ui.success(message)] });
  }
}
```

```ts
// src/commands/music/SkipCommand.ts
import {
  ApplicationCommandOptionType,
  Command,
  type ChatInputCommandInteraction,
} from "cc-discord-framework";
import { MusicError } from "@cc-discord-framework/music";
import { describeTrack, requireQueue } from "./_shared.js";

/** まとめてスキップできる曲数の上限(この Bot が決めている値)。 */
const MAX_SKIP_COUNT = 10;

@Command.define({
  description: "再生中の曲をスキップします。",
  options: [
    {
      type: ApplicationCommandOptionType.Integer,
      name: "count",
      description: `まとめてスキップする曲数(1〜${MAX_SKIP_COUNT}、既定は1)`,
      required: false,
      min_value: 1,
      max_value: MAX_SKIP_COUNT,
    },
  ],
})
export class SkipCommand extends Command {
  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const queue = requireQueue(this.services.audio, interaction);
    const count = interaction.options.getInteger("count") ?? 1;

    // skip() の後は current が入れ替わるので、先に控えておく。
    const skipped = queue.current;
    // 指定より残りが少なければ、あるだけしか飛ばせない。
    // 実際に飛ばした数(戻り値)を表示する — 指定数のまま表示すると嘘になる。
    const actual = queue.skip(count);

    // 再生終了後〜自動退出までの待ち時間は「キューはあるが何も無い」。
    // その間の /skip は何もしていないので、成功と言わない。
    if (actual === 0) {
      throw new MusicError("スキップできる曲がありません(再生が終わっています)。");
    }

    const from = skipped ? describeTrack(skipped) : "再生中の曲";
    const message =
      actual > 1 ? `⏭️ ${from} から${actual}曲スキップしました。` : `⏭️ ${from} をスキップしました。`;
    await interaction.reply({ embeds: [this.services.ui.success(message)] });
  }
}
```

コマンドの書き方そのものは[コマンドガイド](../framework/guides/commands.md)を参照してください。

## ffmpeg について

音源が **opus を含む webm / ogg** を返す場合、変換も opus エンコードも行われず、ffmpeg は不要で CPU もほぼゼロになります。mp3・flac・wav などは変換が必要なため ffmpeg が要ります。見つからない場合は起動時に警告が出ます(Bot 自体は動きます)。

## 音源を追加する

YouTube / SoundCloud は [Music Sources](./music-sources.md) を並べるだけです。それ以外の音源も、`resolvers/`(入力 → トラック情報)と `providers/`(トラック → 音声ストリーム)にクラスを置くだけで追加できます。詳しい手順は [music プラグインの README](https://github.com/CHACCHAN/cc-discord-framework/tree/main/plugins/music#音源を追加する) を参照してください。

## 互換性

| 項目 | 要件 |
| --- | --- |
| ランタイム | Bun 1.4+(ネイティブモジュール不使用 — opus は純 JS の `opusscript`) |
| discord.js | v14 |
| フレームワーク | `cc-discord-framework` ^2.0.0(peer dependency) |
| 追加の依存 | `@discordjs/voice`・`opusscript`(同梱)。mp3 / flac などの変換時のみ ffmpeg |
