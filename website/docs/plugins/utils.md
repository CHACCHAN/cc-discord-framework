---
sidebar_position: 2
---

# Utils

`@cc-discord-framework/utils` は **小さな便利機能の詰め合わせ** です。コアに入れるほど普遍的ではないけれど、Bot を書けばだいたい毎回書くことになるものを集めています。

| 種類 | 内容 |
| --- | --- |
| コンポーネント種別 | `Task`(`tasks/` — 定期実行) |
| サービス | `this.services.ui` — テーマ済みの埋め込みと UI |
| UI | `confirm()`・`paginate()`・`createEmbeds()` |
| 整形 | `formatDuration()`・`humanizeDuration()`・`parseDuration()` |
| 文字列 / 配列 | `truncate()`・`chunk()`・`splitMessage()`・`progressBar()` |

このパッケージは **2層構造** です。UI と整形は **ただの関数** なので、`plugins: [utils()]` を入れなくても import するだけで使えます。プラグインとしての登録が必要なのは、コンポーネント種別(`tasks/`)とテーマ・`this.services.ui` を有効にするときだけです。

discord.js が既に持っているもの(`codeBlock`・`bold`・`escapeMarkdown`・`time` など)は入っていません — `cc-discord-framework` から直接使えます。

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
bun add @cc-discord-framework/utils
```

```ts
import { Client, GatewayIntentBits } from "cc-discord-framework";
import { utils } from "@cc-discord-framework/utils";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  plugins: [utils()],
});
```

## 設定

`utils()` に渡せるオプションは3つです。

| オプション | 既定 | 意味 |
| --- | --- | --- |
| `theme` | `defaultTheme` | Bot 全体の見た目。指定した項目だけが既定値を上書きします |
| `scheduler` | `true` | `tasks/` の自動ロードと定期実行を有効にする |
| `ui` | `true` | `this.services.ui` を登録する |

### テーマ — 色・記号・文言のカスケード

色・ラベル・記号・既定の待ち時間は **テーマ** に集約されていて、ハードコードされて変えられない見た目はありません。差し替えの入口は3段階で、右のものほど優先されます。**置き換えではなく重ね合わせ** なので、その場で1項目だけ変えても Bot 全体の設定は残ります。

```
defaultTheme  →  utils({ theme })  →  各呼び出しの options
（既定値）        （Bot 全体）         （その場限り）
```

```ts
plugins: [
  utils({
    theme: {
      colors: { success: 0x00ffaa },                      // 指定した色だけ変わる
      confirm: { yes: { label: "はい", emoji: "✅" } },   // ボタンは部分指定でよい
      pagination: { counter: (c, t) => `${c}ページ目 / 全${t}` },
      progress: { filled: "▰", empty: "▱" },
      duration: {
        units: { h: "時間", m: "分" }, separator: "",   // humanizeDuration → "1時間2分"
        clock: { separator: ":", pad: "0" },            // formatDuration  → "1:02:03"
      },
      text: { ellipsis: "..." },
    },
  }),
]
```

テーマはクライアントの `container.theme` に置かれるため、複数クライアントを立てても設定は混ざりません。

ひとつだけ注意があります。`progressBar()` や `truncate()` のような **素の関数はクライアントを知らない** ため、真ん中の `utils({ theme })` を飛ばして `defaultTheme` を既定に使います。Bot 全体のテーマを効かせたい場合は `this.services.ui` 経由で呼んでください(後述)。`confirm()` と `paginate()` はインタラクションからクライアントを辿ってテーマを自分で見つけるので、そのまま呼んで構いません。

## 使い方

### 埋め込み(`this.services.ui`)

テーマの色を付けるだけの薄いヘルパーです。`success`・`error`・`warning`・`info`・`of` の5つがあり、返るのは discord.js の `EmbedBuilder` そのものなので、以降はいつもどおりチェーンできます。`error()` には `Error` をそのまま渡せます。

```ts
await interaction.reply({ embeds: [this.services.ui.success("設定を保存しました。")] });
await interaction.reply({ embeds: [this.services.ui.error(error).setTitle("失敗")] });
this.services.ui.of(0x5865f2, "任意の色");
```

整形系もサービス経由で呼べば Bot 全体のテーマが効きます。

```ts
this.services.ui.progressBar(30, 100);   // テーマの filled / empty / width
this.services.ui.humanize(3_723_000);    // テーマの units / separator
this.services.ui.truncate(text, 100);    // テーマの ellipsis
```

コンポーネントの外(クライアントが手元にない場所)では `createEmbeds(theme)` にテーマを明示的に渡します。

### 定期実行(`Task`)

`tasks/` にクラスを置くだけでスケジュールされます。登録も配線も不要です。

```ts
// src/tasks/CleanupTask.ts
import { Task } from "@cc-discord-framework/utils";

@Task.define({ every: "1h", runOnStart: true })
export class CleanupTask extends Task {
  override async run() {
    this.logger.info("クリーンアップを実行します");
  }
}
```

| オプション | 既定 | 意味 |
| --- | --- | --- |
| `every` | —(必須) | 実行間隔。ミリ秒か `"90s"` `"1h30m"` `"2d"` のような期間表記 |
| `runOnStart` | `false` | ready 直後にも一度実行する |
| `overlap` | `false` | 前回の `run()` が終わっていないとき、次の周期を重ねて実行する。既定では重ねずにその周期をスキップします |

覚えておきたいふるまい:

- タスクはクライアントの ready 後にスケジュールされ、アンロード / `client.destroy()` で停止します。
- `run()` の例外はログに記録されるだけで、スケジュールは止まりません。
- 既定(`overlap: false`)では、遅い `run()` が interval ごとに積み重なることはありません。
- **`every` の上限は 2^31−1 ミリ秒(約24.8日)** です。タイマーの 32bit 制限に由来し、超える指定はロード時にエラーになります。それより長い周期は、短い間隔で起きて `run()` 側で日付を確かめてください。

定期実行が不要なら `utils({ scheduler: false })` で無効化できます。

### 確認 UI(`confirm`)

タイムアウトも拒否も `false` になるので、`if` ひとつで書けます。応答後・時間切れのどちらでもボタンは自動的に無効化されます。

```ts
import { confirm } from "@cc-discord-framework/utils";

if (!(await confirm(interaction, { content: "全件削除します。よろしいですか?" }))) return;
await purge();
```

| オプション | 既定 | 意味 |
| --- | --- | --- |
| `content` / `embeds` | — | 表示内容 |
| `yes` / `no` | テーマの `confirm` | ボタン。文字列ならラベルだけ、オブジェクトなら絵文字と色も |
| `timeout` | テーマの `"1m"` | この時間で応答が無ければ `false` |
| `userId` | 呼び出したユーザー | 押せるユーザー |
| `anyone` | `false` | 誰でも押せるようにする |
| `ephemeral` | `false` | 本人にだけ見える返信にする |
| `theme` | クライアントのテーマ | この呼び出しだけテーマを上書きする |

### ページ送り(`paginate`)

`EmbedBuilder` の配列を渡すと、前後移動のボタン付きで送信します。端のボタンは自動で無効化され、ページが1つだけならボタンは付きません。`timeout`(既定 `"2m"`)は **無操作の時間** で、過ぎるとボタンを無効化して終了します。戻り値は送信直後のメッセージで、ページ送り自体はそのあとバックグラウンドで動き続けます。

ボタンのラベル・色・現在位置の表記はテーマで決まり、`buttons` / `counter` / `showCounter` でその場だけ変えられます。

```ts
await paginate(interaction, { pages, buttons: { next: "つぎ" }, showCounter: false });
```

コレクターを自分で書きたい場合は、ボタン列だけを `paginationRow(current, total, "myprefix", { target: interaction })` で作れます(`target` を渡すとテーマが効きます)。

### 整形ヘルパー(プラグイン登録なしで使えます)

```ts
import {
  parseDuration, formatDuration, humanizeDuration,
  truncate, chunk, splitMessage, progressBar,
} from "@cc-discord-framework/utils";

parseDuration("1h30m");        // 5400000 — 数値・期間表記のどちらも受ける
formatDuration(3_723_000);     // "1:02:03" — 再生位置など
humanizeDuration(3_723_000);   // "1h 2m"  — クールダウン、稼働時間など

truncate("とても長い説明文……", 10);   // 上限に収める(サロゲートペアを壊さない)
chunk(items, 10);                     // ページの元データ作り
splitMessage(longText);               // 2000 文字ごとに分割(区切りは改行優先)
progressBar(30, 100, { width: 10 });  // "███░░░░░░░"
```

`parseDuration()` は期間を受け取るあらゆる API の入口に置けます(`Task` の `every` もこれを通しています)。

## コード例

リポジトリの `client/src/commands/music/QueueCommand.ts` は、`chunk()` + `this.services.ui` + `paginate()` を組み合わせた実例です。

```ts
import { chunk, paginate, type Page } from "@cc-discord-framework/utils";
import { Command, type ChatInputCommandInteraction } from "cc-discord-framework";

const PAGE_SIZE = 10;

@Command.define({ description: "再生キューを表示します。" })
export class QueueCommand extends Command {
  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const queue = requireQueue(this.services.audio, interaction);
    const current = queue.current ? describeTrack(queue.current) : "なし";
    const total = queue.tracks.length;

    const chunks = chunk(queue.tracks, PAGE_SIZE);
    const bodies =
      chunks.length === 0
        ? ["(待機中の曲はありません)"]
        : chunks.map((tracks, page) =>
            tracks
              .map((track, offset) => `\`${page * PAGE_SIZE + offset + 1}.\` ${describeTrack(track)}`)
              .join("\n"),
          );

    const pages: Page[] = bodies.map((body, page) =>
      this.services.ui
        .info(`**▶️ 再生中**\n${current}\n\n**⏭️ 待機中**\n${body}`)
        .setTitle("再生キュー")
        .setFooter({ text: `${page + 1}/${bodies.length}ページ・待機${total}曲` }),
    );

    // ページが1つだけならボタンは付きません(paginate が判断します)。
    await paginate(interaction, { pages });
  }
}
```

コマンドの書き方そのものは[コマンドガイド](../framework/guides/commands.md)を参照してください。

## 互換性

| 項目 | 要件 |
| --- | --- |
| ランタイム | Bun 1.4+ |
| discord.js | v14 |
| フレームワーク | `cc-discord-framework` ^2.0.0(peer dependency) |
| 追加の依存 | なし |
