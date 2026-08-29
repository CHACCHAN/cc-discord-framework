# @cc-discord-framework/ai

[cc-discord-framework](../../README.md) の公式 AI プラグイン。
[Vercel AI SDK](https://ai-sdk.dev/) を使い、**複数プロバイダー対応の AI 機能**と
**`ai/` に置くだけで LLM から呼べる関数**を提供します。

```sh
bun add @cc-discord-framework/ai
```

```ts
import { Client, GatewayIntentBits } from "@cc-discord-framework/core";
import { ai } from "@cc-discord-framework/ai";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  plugins: [ai({ model: "google:gemini-2.5-flash" })],
});
```

これで `ai/` の自動ロードと `this.services.ai` が使えるようになります。

## コマンドは登録しません

このプラグインが提供するのは **`ai/` の自動ロード**・**`this.services.ai`**・
**イベント**、そしてそれらのふるまいを決める設定だけです。
`/ask` のようなスラッシュコマンドは **Bot の機能** なので、Bot 側
(`client/src/commands/`)で明示的に書いてください。

defer・ストリーミング表示・長文の分割・失敗時の表示は `reply()` が
引き受けるので、コマンド本体は数行で済みます。

```ts
// client/src/commands/ai/AskCommand.ts
import {
  ApplicationCommandOptionType,
  Command,
  type ChatInputCommandInteraction,
} from "@cc-discord-framework/core";

@Command.define({
  description: "AI に質問します。",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "prompt",
      description: "聞きたいこと",
      required: true,
    },
  ],
})
export class AskCommand extends Command {
  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    await this.services.ai.reply(interaction, {
      prompt: interaction.options.getString("prompt", true),
      history: interaction.channelId, // 省略すれば一問一答
    });
  }
}
```

コマンド名・説明文・オプション・権限は Bot 側のものです。応答の見せ方
(埋め込み・分割・カーソル・文言)だけがプラグイン側の
`ai({ texts, display, stream })` で決まります。

## 設計: ツールは「置くだけ」

`ai/` に `AiTool` を置くと、そのまま **モデルから呼べる関数** になります。
中では他のコンポーネントと同じく `this.services.*` / `this.container` /
`this.logger` が使えるので、Bot が既に持っている機能をそのまま AI へ
開放できます。**これがこのプラグインの核心です。**

```ts
// ai/ServerInfoTool.ts
import { AiTool } from "@cc-discord-framework/ai";
import { z } from "zod";

const input = z.object({ 詳細: z.boolean().optional() });

@AiTool.define({ description: "このサーバーの情報を返します。", inputSchema: input })
export class ServerInfoTool extends AiTool<z.infer<typeof input>> {
  override async execute(args, context) {
    const guild = context.interaction?.guild;
    return { name: guild?.name, members: guild?.memberCount };
  }
}
```

| 項目 | 説明 |
| --- | --- |
| `description` | **必須**。これを読んでモデルが呼ぶか決めます |
| `inputSchema` | **必須**。zod でも JSON Schema でも構いません |
| `enabled` | `false` にすると読み込まれても渡されません(既定 `true`) |
| `guildOnly` | サーバー内からの呼び出しでだけ渡します(既定 `false`) |

ツール名はクラス名から導出されます(`ServerInfoTool` → `server-info`)。
**ディレクトリ名は `ai/`、クラス名の接尾辞は `Tool`** です — 「誰のツールか」
が判るようにディレクトリだけ `ai/` にしてあり、クラス側の慣例は変わりません。
`ai/` の中はサブディレクトリで分けても構いません(`ai/music/` など)。
**サブディレクトリは整理のためだけで、コンポーネント名には影響しません。**
`_` で始まるファイル・ディレクトリは共有コード扱いで読み込まれません。

ロード済みのツールは `client.stores.get("ai")`(`AiToolStore`)で参照できます。

`execute` が投げた例外は握りつぶされません。ログと `aiError` を経由して
**エラー内容がモデルへ返る**ので、ツール1つの失敗で会話全体が止まりません。
`tools.timeout`(既定 30 秒)を超えた場合も同じ扱いです。

## プロバイダーは使うものだけ入れる

`@ai-sdk/*` は **optional peer dependency** です。文字列で名指しされたときに
だけ動的 import するので、入っていないプロバイダーがあっても起動は落ちません。
入っていないものを指定すると `bun add ...` を案内するエラーになります。

同梱リゾルバが最初から知っているのは4つです。

| 指定 | パッケージ | 環境変数 |
| --- | --- | --- |
| `openai:<id>` | `@ai-sdk/openai` | `OPENAI_API_KEY` |
| `anthropic:<id>` | `@ai-sdk/anthropic` | `ANTHROPIC_API_KEY` |
| `google:<id>` | `@ai-sdk/google` | `GOOGLE_GENERATIVE_AI_API_KEY` |
| `compatible:<id>` | `@ai-sdk/openai-compatible` | 既定では読みません |

`compatible` だけは API キーの環境変数を持ちません(Ollama のように
認証が要らない相手もあるため)。**認証を掛けているエンドポイントでは
`apiKey` を必ず渡してください** — 渡さないと `Authorization` ヘッダーが
付かず 401 になります。

```ts
ai({
  model: "compatible:my-model",
  providers: {
    compatible: {
      name: "openwebui",
      baseURL: "https://example.com/api",
      apiKey: Bun.env.AI_TOKEN,        // Authorization: Bearer として送られる
    },
  },
})
```

### ローカル LLM は `compatible` から

**Ollama 専用の公式 AI SDK プロバイダーはありません**(`ollama-ai-provider` は
メンテナンスされていません)。Ollama / LM Studio / vLLM / llama.cpp /
OpenRouter はいずれも **OpenAI 互換 API** なので、`compatible` で繋ぎます。

```ts
ai({
  model: "compatible:llama3.2",
  providers: { compatible: { name: "ollama", baseURL: "http://localhost:11434/v1" } },
})
```

### 一覧に無いプロバイダーを足す

`providerLoaders` に同じ形で書くだけで、文字列指定の対象になります。

```ts
ai({
  model: "groq:llama-3.3-70b-versatile",
  providerLoaders: {
    groq: {
      package: "@ai-sdk/groq",
      factory: "createGroq",
      apiKeyEnv: "GROQ_API_KEY",
      requiresEndpoint: false,
    },
  },
})
```

もっと自由に組みたい場合は、自前のレジストリをそのまま渡せます。

```ts
import { createProviderRegistry } from "ai";

ai({ registry: createProviderRegistry({ ... }), model: "myns:fast" })
```

`LanguageModel` を直接渡すこともできます(`ai({ model: openai("gpt-5") })`)。

### 既定のモデルはありません

勝手に課金される先を既定にしないため、`model` に既定値は置いていません。
未設定のまま使うと「設定してください」というエラーになります。
まずは **無料枠のあるモデル**(Google Gemini や Groq)から試すのがおすすめです。

## `this.services.ai`

| メソッド | 役割 |
| --- | --- |
| `ask(prompt, options?)` | 一問一答。本文の文字列を返します |
| `generate(options)` | `generateText` の薄いラッパ。結果をそのまま返します |
| `stream(options)` | `streamText` の薄いラッパ |
| `object(schema, prompt, options?)` | `generateObject`。解析済みのオブジェクトを返します |
| `reply(target, options)` | **Discord へストリーミング表示しながら答えます** |
| `model(id?)` | モデル指定の解決 |
| `tools(context?)` | 登録済みの `AiTool` から `ToolSet` を作ります |
| `history(key)` / `forget(key)` | 会話履歴の取得・消去(キーは呼び出し側が決めます) |
| `memory` | 会話履歴の置き場(`{ get, append, clear }`) |
| `config` | このクライアントの解決済み設定 |

共通オプション(`model` / `instructions` / `tools` / `temperature` /
`maxOutputTokens` / `maxSteps` / `stopWhen` / `abortSignal` / `timeout` /
`history` / `context` / `messages`)は、省略すると設定の既定値になります。

## Discord へのストリーミング表示

`reply()` は Discord の制限に合わせて次のように振る舞います。

1. まだなら `deferReply()`(メッセージ宛なら仮のメッセージを送信)
2. 生成しながら **`stream.intervalMs`(既定 1200ms)ごとに1回だけ**編集
   — 前回と同じ内容ならスキップ、**編集が飛行中なら撃たない**
3. 途中は末尾に `stream.cursor`(既定 `▌`)を添え、最後に外す
4. **途中経過**が `display.splitThreshold` を超えたら `texts.truncated` で
   切り詰める(進捗表示なので分割はしません)
5. **最終出力**が `display.splitThreshold` を超えたら分割し、2通目以降は
   `followUp()`

`stream.enabled: false` なら「完成してから1回だけ送る」動作になります。

`display.splitThreshold` の既定は `"auto"` で、分割位置は
**その呼び出しで実際に使う表示方法**から決まります — `reply(interaction,
{ embeds: false })` のように呼び出しごとに上書きしても 2000 で分割されます。
数値を指定した場合は、表示方法によらずその値が使われます。ただし明示した
値でも、埋め込みなら 4096、プレーンテキストなら 2000 を超えた分は上限に
丸められます — 超えた指定は必ず送信に失敗するためです。

**生成の失敗は throw せず、応答へ表示します**(すでに Discord の応答を
引き受けているため)。検知したい場合は `aiError` を購読するか、戻り値の
`error` を見てください。入力が長すぎる・クールダウン中・モデル未設定といった
**表示を引き受ける前の失敗**はそのまま throw するので、フレームワークの
既定処理が返信します。

> `promptTooLong` / `cooldown` / `modelNotConfigured` / `promptEmpty` の4つは
> **表示を引き受ける前**に throw されるので、フレームワークの既定処理が
> プレーンテキスト + Ephemeral で返します。**`display` の設定は効きません。**
> 器も揃えたい場合は `commandError` のリスナーを置いてください。

戻り値の `text` は **モデルが返した本文**です(表示された本文ではありません)。
失敗した場合も、途中まで生成された分はここに残ります。

### メンションは既定で発火しません

モデルの出力はそのまま本文へ流れるので、既定の `display.allowedMentions` は
**`{ parse: [] }`(どのメンションも解決しない)** です。プロンプト
インジェクションで `@everyone` を書かれても発火しません。

```ts
ai({ display: { allowedMentions: { parse: ["users"] } } })  // ユーザーだけ許可
ai({ display: { allowedMentions: null } })                  // discord.js の既定に任せる
```

### 送信ペイロードに手を入れる

`display.payload` は **埋め込み経路とプレーンテキスト経路の両方**で、
送信直前に必ず通ります(`display.decorate` は埋め込み専用で、`payload` は
その後に走ります)。`components` / `files` はペイロードの型に含まれている
ので、ボタンや添付をそのまま足して返せます。

```ts
ai({
  display: {
    payload: (payload, { kind, index, total, streaming }) =>
      streaming || index < total ? payload : { ...payload, components: [row] },
  },
})
```

| `context` | 意味 |
| --- | --- |
| `kind` | 応答の意味づけ(`"success"` / `"info"` / `"warning"` / `"error"`) |
| `index` | 分割された何通目か(1始まり) |
| `total` | 分割された総通数 |
| `streaming` | 途中経過か(あとで書き換わる送信なら `true`) |

### 呼び出し単位で見た目を変える

`display` と `texts` は **`reply()` の引数でも**項目単位で上書きできます。
設定はクライアント全体の既定、引数はその呼び出しだけの上書きです
(`decorate` / `payload` は関数ごと置き換わります)。フラットな
`embeds` / `ephemeral` は `display` の同名キーのショートハンドで、両方
指定した場合はフラットな指定が優先です。

```ts
await this.services.ai.reply(interaction, {
  prompt,
  kind: "warning",                       // 埋め込みの色(テーマの4色に対応)
  display: {
    decorate: (embed) => embed.setTitle("質問への回答").setTimestamp(),
    payload: (payload) => ({ ...payload, components: [row] }),
    allowedMentions: { parse: ["users"] },
  },
  texts: {
    answerBody: ({ answer, sources }, texts) =>
      [answer, "", texts.sourcesHeader, ...sources].join("\n"),
  },
});
```

## 会話履歴

既定はメモリ内の履歴です。タイマーを持たず、TTL 切れは取得時に捨てるだけ
なので、後始末が要りません。

```ts
ai({ memory: { enabled: true, maxMessages: 20, ttl: "1h" } })
```

履歴のキーは **呼び出し側が決めます** — `reply()` / `generate()` の `history`
に渡した文字列がそのままキーです。チャンネル単位にもユーザー単位にもできます。

```ts
await this.services.ai.reply(interaction, { prompt, history: interaction.channelId });
await this.services.ai.reply(interaction, {
  prompt,
  history: `${interaction.channelId}:${interaction.user.id}`, // ユーザーごとに独立
});
await this.services.ai.forget(`${interaction.channelId}:${interaction.user.id}`);
```

消すときも同じキーを渡してください(キーの決め方を1箇所に切り出しておくと、
「消したはずなのに残っている」が起きません)。

Redis や DB へ置きたい場合は `store` を差し替えてください。
インターフェースは **3つだけ** です。

```ts
ai({
  memory: {
    store: {
      get: (key) => /* ModelMessage[] */,
      append: (key, messages) => { /* ... */ },
      clear: (key) => { /* ... */ },
    },
  },
})
```

## イベント

`Listener` コンポーネントで型付きのまま観測できます。

| イベント | 引数 |
| --- | --- |
| `aiRequest` | `(request)` |
| `aiResponse` | `(response, request)` |
| `aiToolCall` | `(tool, input, context)` |
| `aiError` | `(error, info)` |

`aiError` は「内部で処理したエラー」(生成の失敗・ツールの失敗・表示の失敗・
履歴の読み書きの失敗)を知らせます。**購読しているリスナーが1つでもいれば、
既定動作(ログ)は走りません** — フレームワークの `commandError` と同じ形です。

`info.phase` に入るのは `"generate"`(ストリーミングも含みます)/ `"tool"` /
`"display"` / `"memory"` の4つだけです。

### ストリーミング中の失敗も必ず届きます

AI SDK は失敗を `textStream` へ流しません(`onError` と `fullStream` の
error パートにだけ流します)。そのため素直に書くと、**1断片も出ないまま
失敗したときに原因が消えて**「No output generated.」しか残りません
(実際に 401 Unauthorized がこれに化けていました)。

このプラグインは `onError` を必ず張って本当の原因を取り戻します。

- 1断片も出ずに失敗した → 本当の原因が `aiError` と応答の両方に出ます
- 途中まで出てから失敗した → **回答は残したまま**、失敗は `aiError` に出ます
- `stream()`(薄いラッパ)でも、失敗は `aiError` とログに出ます

### ツール非対応のモデルに注意

**function calling に対応していないモデルへツールを渡すと、エラーも出さずに
空の応答が返ることがあります**(実測した OpenAI 互換エンドポイントでは、
ツールあり 3/3 で空・ツールなし 3/3 で成功でした)。Bot 側からは
`texts.emptyResponse` しか見えず原因が判らないため、本文が空になった場合は
**ツールを何個渡したかをログの警告に残します**。

そういうモデルを使うときはツールを切ってください:

```ts
ai({ tools: { enabled: false } })
```

HTTP エラーはステータスコードが添えられます(`Unauthorized(HTTP 401)`)。
言い換えたい場合は `texts.apiCallFailed` を差し替えてください:

```ts
ai({
  texts: {
    apiCallFailed: (status, message) =>
      status === 401 ? "APIキーを確認してください。" : `${message}(HTTP ${status})`,
  },
})
```

## 文言・記号・間隔・上限はすべて差し替えられます

**ユーザーに見えるもので、ハードコードされて変えられない値はありません。**
文言は `texts`、記号・間隔・上限・見せ方は `stream` / `limits` / `display` に
集約されていて、指定した項目だけが既定値を上書きします(埋め込みの色は
`utils()` のテーマか `display.decorate` で変えられます)。
固定なのは開発者向けのログとロード時のエラーだけです。

```ts
ai({
  instructions: "あなたはこのサーバーの案内役です。",
  temperature: 0.3,
  maxSteps: 5,                 // stopWhen: stepCountIs(5) になります
  timeout: "120s",
  tools:   { enabled: true, timeout: "30s" },
  memory:  { enabled: true, maxMessages: 20, ttl: "1h" },
  stream:  { enabled: true, intervalMs: 1200, cursor: "▌" },
  limits:  { maxPromptLength: 4000, maxResponseLength: false, cooldown: false },
  display: {
    embeds: true,
    ephemeral: false,
    allowedMentions: { parse: [] },          // 既定。null で discord.js の既定に任せる
    decorate: (embed) => embed.setTitle("AI"),
    payload: (payload, context) => payload,
  },
  texts:   { thinking: "考え中…", apiCallFailed: (status, m) => `${m} (${status})` },
})
```

期間を取る項目はミリ秒でも `"30s"` / `"1h30m"` のような期間表記でも書けます。
`false` にすると無制限です。

`limits.cooldown` は、同じユーザーが続けて `reply()` を呼べるまでの間隔
です。**本文を1文字も届けられなかった失敗は数えません** — モデル未設定や
プロバイダー障害などで何も表示できなかった呼び出しは払い戻されます。
途中まで表示できた応答は利用として数えます。

### 本文の組み立てごと差し替えられます

`texts.answerBody` は、回答・引用元・使用ツール・トークン数の断片を受け取って
1つの本文にする関数です。**並び順・区切り・空行まで利用者が決められます。**
断片は常に計算されて渡るので、既定では出していない情報も出せます。

```ts
ai({
  texts: {
    answerBody: ({ answer, cursor, sources, tools, usage }, texts) =>
      [
        answer + (cursor ?? ""),
        ...(tools.length > 0 ? ["", texts.toolsHeader, ...tools] : []),
        ...(sources.length > 0 ? ["", texts.sourcesHeader, ...sources] : []),
        ...(usage === null ? [] : ["", usage]),
      ].join("\n"),
  },
})
```

整形済みの文字列に加えて生の値(`rawSources` / `rawTools` / `rawUsage`)も
渡るので、整形ごと作り直すこともできます。

既定では **使用ツールとトークン数は出しません**(`texts.toolsHeader` も
`texts.usageLine` も既定の `answerBody` からは呼ばれません)。出したい場合は
上のように `answerBody` を差し替えてください。

**生成に失敗したときもここを通ります。** `failure` に整形済みのエラー文言
(`texts.generationFailed` を通したもの)が入り、`answer` には途中まで生成
された本文が残るので、「途中までの回答を残してエラーを添える」が書けます。
既定の実装は `failure` だけを出すので、指定しなければ表示は変わりません。

```ts
ai({
  texts: {
    answerBody: ({ answer, failure }) =>
      failure === null ? answer : `${answer}\n\n⚠️ ${failure}`,
  },
})
```

## 依存関係

```
dependencies:  ai ^7.0.77 / zod ^4.4.3 / @cc-discord-framework/utils
peer:          @cc-discord-framework/core ^2.0.0
peer(optional): @ai-sdk/openai / @ai-sdk/anthropic / @ai-sdk/google / @ai-sdk/openai-compatible
```

プロバイダーは **使うものだけ** `bun add` してください。
