# @cc-discord-framework/utils

cc-discord-framework 公式プラグイン — **小さな便利機能の詰め合わせ**。

コアに入れるほど普遍的ではないけれど、Bot を書けばだいたい毎回書くことに
なるものを集めています。ひとつずつでは専用パッケージにするほどの大きさが
ないので、ここへまとめました。

```sh
bun add @cc-discord-framework/utils
```

```ts
import { Client, GatewayIntentBits } from "@cc-discord-framework/core";
import { utils } from "@cc-discord-framework/utils";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  plugins: [utils()],
});
```

## 中身

| 種類 | 内容 |
| --- | --- |
| コンポーネント種別 | `Task`(`tasks/` — 定期実行) |
| サービス | `this.services.ui` — テーマ済みの埋め込みと UI |
| UI | `confirm()`・`paginate()`・`createEmbeds()` |
| 整形 | `formatDuration()`・`humanizeDuration()`・`parseDuration()` |
| 文字列 / 配列 | `truncate()`・`chunk()`・`splitMessage()`・`progressBar()` |

**UI と整形はただの関数** なので、`utils()` を入れなくても import する
だけで使えます。`plugins: [utils()]` が必要なのはコンポーネント種別
(`tasks/`)とテーマ・`this.services.ui` を有効にするときです。

discord.js が既に持っているもの(`codeBlock`・`bold`・`escapeMarkdown`・
`time` など)はここに置いていません — `@cc-discord-framework/core` から直接
使えます。

---

## 見た目はすべて差し替えられます

色・ラベル・記号・既定の待ち時間は **テーマ** に集約されています。
ハードコードされていて変えられない見た目はありません。

差し替えの入口は3段階で、右のものほど優先されます。**置き換えではなく
重ね合わせ**なので、その場で1項目だけ変えても Bot 全体の設定は残ります。

```
defaultTheme  →  utils({ theme })  →  各呼び出しの options
（既定値）        （Bot 全体）         （その場限り）
```

ただし `progressBar()` `truncate()` `formatDuration()` `humanizeDuration()`
の **素の関数はクライアントを知らない** ため、真ん中を飛ばして
`defaultTheme` を既定に使います。Bot 全体のテーマを効かせたい場合は
`this.services.ui` 経由で呼んでください(下記)。

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

テーマはクライアントの `container.theme` に置かれるので、**複数
クライアントを立てても設定は混ざりません**。

`confirm()` と `paginate()` はインタラクションからクライアントを辿って
テーマを自分で見つけます。埋め込みや進捗バーには手がかりがないので、
コンポーネントの中では `this.services.ui` を使ってください:

```ts
await interaction.reply({ embeds: [this.services.ui.success("保存しました。")] });
this.services.ui.progressBar(30, 100);   // テーマの文字と幅
this.services.ui.humanize(3_723_000);    // テーマの単位
```

クライアントの外で使いたい場合は `createEmbeds(theme)` に明示的に渡します。

---

## 定期実行(`Task`)

`tasks/` にクラスを置くだけでスケジュールされます。

```ts
// tasks/CleanupTask.ts
import { Task } from "@cc-discord-framework/utils";

@Task.define({ every: "1h", runOnStart: true })
export class CleanupTask extends Task {
  override async run() {
    const removed = await this.services.storage.purgeExpired();
    this.logger.info({ removed }, "期限切れを削除しました");
  }
}
```

| オプション | 意味 |
| --- | --- |
| `every` | 実行間隔。ミリ秒か `"90s"` `"1h30m"` `"2d"` のような期間表記。**必須**。上限は 2^31−1 ミリ秒(約24.8日)。 |
| `runOnStart` | ready 直後にも一度実行する。既定 `false`。 |
| `overlap` | 前回の `run()` がまだ終わっていないときに、次の周期を重ねて実行する。既定 `false` — 重ねずにその周期をスキップします。 |

タスクはクライアントの ready 後にスケジュールされ、アンロード /
`client.destroy()` で停止します。`run()` の例外はログに記録されるだけで、
スケジュールは止まりません。既定では前回の `run()` が終わるまで次の周期を
飛ばすので、遅い `run()` が interval ごとに積み重なることもありません
(重ねたい場合だけ `overlap: true`)。

`every` の上限(2^31−1 ミリ秒 ≒ 24.8日)はタイマーの 32bit 制限に
由来します — 超える遅延は 1ms に化けて連発するため、超える指定はロード時に
エラーになります。それより長い周期は、短い間隔で起きて `run()` 側で
日付を確かめてください。

不要なら `utils({ scheduler: false })` で無効化できます。

---

## 確認 UI(`confirm`)

タイムアウトも拒否も `false` になるので、`if` ひとつで書けます。

```ts
if (!(await confirm(interaction, { content: "全件削除します。よろしいですか?" }))) return;
await purge();
```

| オプション | 既定 | 意味 |
| --- | --- | --- |
| `content` / `embeds` | — | 表示内容。 |
| `yes` / `no` | テーマの `confirm` | ボタン。文字列ならラベルだけ、オブジェクトなら絵文字と色も。 |
| `timeout` | テーマの `"1m"` | この時間で応答が無ければ `false`。 |
| `userId` | 呼び出したユーザー | 押せるユーザー。 |
| `anyone` | `false` | 誰でも押せるようにする。 |
| `ephemeral` | `false` | 本人にだけ見える返信にする。 |
| `theme` | クライアントのテーマ | この呼び出しだけテーマを上書きする。 |

応答後・時間切れのどちらでもボタンは自動的に無効化されます。

---

## ページ送り(`paginate`)

```ts
import { chunk, paginate } from "@cc-discord-framework/utils";

const pages = chunk(members, 10).map((page, index) =>
  this.services.ui.info(page.join("\n")).setTitle(`メンバー(${index + 1}ページ目)`),
);

await paginate(interaction, { pages });
```

`《 ‹ 2/5 › 》` のボタンが付き、端では自動的に無効化されます。ページが
1つだけならボタンは付きません。`timeout`(既定 `"2m"`)は **無操作の
時間** で、過ぎるとボタンを無効化して終了します。

戻り値は送信直後のメッセージです。ページ送り自体はそのあとバック
グラウンドで動き続けます。

ボタンのラベル・色・現在位置の表記はテーマで決まり、`buttons` /
`counter` / `showCounter` でその場だけ変えられます:

```ts
await paginate(interaction, { pages, buttons: { next: "つぎ" }, showCounter: false });
```

コレクターを自分で書きたい場合はボタン列だけ使えます。この関数だけでは
どのクライアントの呼び出しか分からないので、テーマを効かせるには
`target` を渡してください:

```ts
// custom_id は "myprefix:next" など
const row = paginationRow(current, total, "myprefix", { target: interaction });
```

---

## 埋め込み(`this.services.ui`)

テーマの色を付けるだけの薄いヘルパーです。返るのは discord.js の
`EmbedBuilder` そのものなので、以降はいつもどおりチェーンできます。

```ts
await interaction.reply({ embeds: [this.services.ui.success("設定を保存しました。")] });
await interaction.reply({ embeds: [this.services.ui.error(error).setTitle("失敗")] });
this.services.ui.of(0x5865f2, "任意の色");
```

`success`・`error`・`warning`・`info`・`of` の5つ。`error()` は `Error` を
そのまま渡せます。色はテーマから来るので、Bot 全体で一度に変えられます。

コンポーネントの外では `createEmbeds(theme)` にテーマを明示的に渡します。

---

## 整形

```ts
parseDuration("1h30m");        // 5400000 — 数値・期間表記のどちらも受ける
formatDuration(3_723_000);     // "1:02:03" — 再生位置など
humanizeDuration(3_723_000);   // "1h 2m"  — クールダウン、稼働時間など

truncate("とても長い説明文……", 10);   // 上限に収める(サロゲートペアを壊さない)
chunk(items, 10);                     // ページの元データ作り
splitMessage(longText);               // 2000 文字ごとに分割(区切りは改行優先)
progressBar(30, 100, { width: 10 });  // "███░░░░░░░"
```

`parseDuration()` は期間を受け取るあらゆる API の入口に置けます
(`Task` の `every` もこれを通しています)。

これらの既定値もテーマの一部です。素の関数はクライアントを知らないため
`defaultTheme` の値を使い、引数で上書きできます。Bot 全体のテーマを
効かせたい場合はサービス経由で呼んでください:

```ts
this.services.ui.progressBar(30, 100);   // テーマの filled / empty / width
this.services.ui.humanize(3_723_000);    // テーマの units / separator / max
this.services.ui.truncate(text, 100);    // テーマの ellipsis
```

---

## ライセンス

MIT
