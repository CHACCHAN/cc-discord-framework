---
sidebar_position: 5
---

# AI

`@cc-discord-framework/ai` は、[Vercel AI SDK](https://ai-sdk.dev/) を使って **複数プロバイダー対応の AI 機能** を追加します。提供するのは次の3つと、それらのふるまいを決める設定です。

| 提供するもの | 内容 |
| --- | --- |
| コンポーネント種別 | `AiTool`(`ai/` — 置くだけでモデルから呼べる関数) |
| サービス | `this.services.ai`(生成・ストリーミング表示・会話履歴) |
| イベント | `aiRequest` / `aiResponse` / `aiToolCall` / `aiError` |

このプラグインは **コマンドを登録しません**。`/ask` のようなスラッシュコマンドは Bot の機能なので、自分の `src/commands/` で書きます。defer・ストリーミング表示・長文の分割・失敗時の表示は `reply()` が引き受けるので、コマンド本体は数行で済みます。

## インストール

```sh
bun add @cc-discord-framework/ai
bun add @ai-sdk/google          # 使うプロバイダーだけ入れる
```

```ts
import { Client, GatewayIntentBits } from "@cc-discord-framework/core";
import { ai } from "@cc-discord-framework/ai";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  plugins: [ai({ model: "google:gemini-2.5-flash" })],
});
```

## モデル指定

`model` には `プロバイダー名:モデルID` 形式の文字列を渡します(例: `"google:gemini-2.5-flash"`)。AI SDK が返す `LanguageModel` を直接渡すこともできます(`ai({ model: openai("gpt-5") })`)。

**既定のモデルはありません。** 勝手に課金される先を既定にしないためで、未設定のまま使うと「設定してください」というエラーになります。まずは無料枠のあるモデル(Google Gemini や Groq)から試すのがおすすめです。

### プロバイダーは使うものだけ入れる

`@ai-sdk/*` は **optional peer dependency** です。文字列で名指しされたときにだけ動的に読み込むので、入っていないプロバイダーがあっても起動は落ちません。入っていないものを指定すると `bun add ...` を案内するエラーになります。同梱リゾルバが最初から知っているのは4つです。

| 指定 | パッケージ | 環境変数 |
| --- | --- | --- |
| `openai:...` | `@ai-sdk/openai` | `OPENAI_API_KEY` |
| `anthropic:...` | `@ai-sdk/anthropic` | `ANTHROPIC_API_KEY` |
| `google:...` | `@ai-sdk/google` | `GOOGLE_GENERATIVE_AI_API_KEY` |
| `compatible:...` | `@ai-sdk/openai-compatible` | 既定では読みません(下記) |

### ローカル LLM・OpenAI 互換 API は `compatible` から

**Ollama 専用の公式プロバイダーはありません**(その名前の非公式パッケージはメンテナンスされていません)。Ollama / LM Studio / vLLM / llama.cpp / OpenRouter / Open WebUI はいずれも OpenAI 互換 API なので、`compatible` で繋ぎます。

```ts
// Ollama(認証なし)
ai({
  model: "compatible:llama3.2",
  providers: { compatible: { name: "ollama", baseURL: "http://localhost:11434/v1" } },
})

// Open WebUI など、認証を掛けているエンドポイント
ai({
  model: "compatible:my-model",
  providers: {
    compatible: {
      name: "openwebui",
      baseURL: "https://example.com/api",
      apiKey: Bun.env.AI_TOKEN,   // Authorization: Bearer として送られる
    },
  },
})
```

`compatible` だけは API キーの環境変数を持ちません(Ollama のように認証が要らない相手もあるため)。**認証を掛けているエンドポイントでは `apiKey` を必ず渡してください** — 渡さないと `Authorization` ヘッダーが付かず 401 になります。

### 一覧に無いプロバイダーを足す

`providerLoaders` に同じ形で書くだけで、文字列指定の対象になります。もっと自由に組みたい場合は AI SDK の `createProviderRegistry()` の戻り値を `ai({ registry })` に渡します。

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

## 使い方

### `this.services.ai`

| メソッド | 役割 |
| --- | --- |
| `reply(target, options)` | **Discord へストリーミング表示しながら答えます**(いちばんよく使います) |
| `ask(prompt, options?)` | 一問一答。本文の文字列を返します |
| `generate(options)` | `generateText` の薄いラッパ。結果をそのまま返します |
| `stream(options)` | `streamText` の薄いラッパ |
| `object(schema, prompt, options?)` | `generateObject`。解析済みのオブジェクトを返します |
| `model(id?)` | モデル指定の解決 |
| `tools(context?)` | 登録済みの `AiTool` から `ToolSet` を作ります |
| `history(key)` / `forget(key)` | 会話履歴の取得・消去(キーは呼び出し側が決めます) |
| `memory` | 会話履歴の置き場(`get` / `append` / `clear`) |
| `config` | このクライアントの解決済み設定 |

共通オプション(`model` / `instructions` / `tools` / `temperature` / `maxOutputTokens` / `maxSteps` / `stopWhen` / `abortSignal` / `timeout` / `history` / `context` / `messages`)は、省略すると設定の既定値になります。

### コード例: `/ask` と `/chat` と `/forget`

リポジトリの `client/src/commands/ai/` にある実物です。

```ts
// src/commands/ai/AskCommand.ts — 一問一答(履歴なし)
import {
  ApplicationCommandOptionType,
  Command,
  type ChatInputCommandInteraction,
} from "@cc-discord-framework/core";

@Command.define({
  description: "AIに質問します(会話履歴は使いません)。",
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
    // defer・ストリーミング表示・長文の分割・失敗時の表示は reply() の担当。
    await this.services.ai.reply(interaction, {
      prompt: interaction.options.getString("prompt", true),
    });
  }
}
```

```ts
// src/commands/ai/ChatCommand.ts — チャンネル単位の会話履歴つき
export class ChatCommand extends Command {
  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    await this.services.ai.reply(interaction, {
      prompt: interaction.options.getString("message", true),
      // 履歴キーはチャンネル ID。同じチャンネルにいる全員で1つの会話を共有する。
      history: interaction.channelId,
    });
  }
}
```

```ts
// src/commands/ai/ForgetCommand.ts — 履歴を消す(キーは /chat と同じにする)
export class ForgetCommand extends Command {
  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const cleared = await this.services.ai.forget(interaction.channelId);
    await interaction.reply({
      embeds: [
        cleared
          ? this.services.ui.success("🧹 このチャンネルの会話履歴を消しました。")
          : this.services.ui.info("消す会話履歴はありませんでした。"),
      ],
    });
  }
}
```

### ツールを足す: `AiTool` を `src/ai/` に置くだけ

`ai/` にクラスを置くと、そのまま **モデルから呼べる関数** になります。中では他のコンポーネントと同じく `this.services.*` / `this.container` / `this.logger` が使えるので、**Bot が既に持っている機能をそのまま AI へ開放できます**。リポジトリの `client/src/ai/NowPlayingTool.ts` の実物です — `/chat` で「いま何の曲?」と聞くと、モデルがこのツールを呼びます。

```ts
// src/ai/NowPlayingTool.ts
import { AiTool, type AiToolContext } from "@cc-discord-framework/ai";
import { z } from "zod";

const input = z.object({
  キュー: z.boolean().optional().describe("待機中の曲を題名の一覧で返すかどうか"),
});

@AiTool.define({
  description:
    "このサーバーで再生中の曲と、待機中の曲の状況を返します。音楽の再生状況を聞かれたら使ってください。",
  inputSchema: input,
  // 再生キューはサーバー単位なので、DM からの呼び出しでは使わせない。
  guildOnly: true,
})
export class NowPlayingTool extends AiTool<z.infer<typeof input>> {
  override execute({ キュー = false }: z.infer<typeof input>, context: AiToolContext) {
    const queue = context.guildId === null ? null : this.services.audio.queue(context.guildId);
    if (!queue?.current) return { 再生中: null, 待機中: 0 };

    return {
      再生中: { 題名: queue.current.title, 演者: queue.current.author },
      待機中: キュー ? queue.tracks.map((track) => track.title) : queue.tracks.length,
    };
  }
}
```

| オプション | 説明 |
| --- | --- |
| `description` | **必須**。これを読んでモデルが呼ぶか決めます |
| `inputSchema` | **必須**。zod でも JSON Schema でも構いません |
| `enabled` | `false` にすると読み込まれても渡されません(既定 `true`) |
| `guildOnly` | サーバー内からの呼び出しでだけ渡します(既定 `false`) |

ディレクトリ名は `ai/`、クラス名の接尾辞は `Tool` です。ツール名はクラス名から導出されます(`NowPlayingTool` → `now-playing`)。`ai/` の中はサブディレクトリで整理しても構いません(名前には影響しません)。`_` で始まるファイル・ディレクトリは共有コード扱いで読み込まれません。

`execute` が投げた例外は握りつぶされません — ログと `aiError` を経由して **エラー内容がモデルへ返る** ので、ツール1つの失敗で会話全体が止まりません。`tools.timeout`(既定 30 秒)を超えた場合も同じ扱いです。

### 会話履歴

既定はメモリ内の履歴です。履歴のキーは **呼び出し側が決めます** — `reply()` / `generate()` の `history` に渡した文字列がそのままキーです。チャンネル単位にもユーザー単位にもできます。消すときも同じキーを `forget()` に渡してください(キーの決め方を1箇所に切り出しておくと、「消したはずなのに残っている」が起きません)。

```ts
await this.services.ai.reply(interaction, { prompt, history: interaction.channelId });
await this.services.ai.reply(interaction, {
  prompt,
  history: `${interaction.channelId}:${interaction.user.id}`, // ユーザーごとに独立
});
```

Redis や DB へ置きたい場合は `memory.store` を差し替えます。インターフェースは `get` / `append` / `clear` の3つだけです。

## `reply()` のストリーミング表示

`reply()` は Discord の制約(3秒以内の応答・15分の有効期限・編集の頻度制限)を守りながら、書き進めるように表示します。

1. まだなら `deferReply()`(メッセージ宛なら仮のメッセージを送信)
2. 生成しながら `stream.intervalMs`(既定 1200ms)ごとに1回だけ編集 — 前回と同じ内容ならスキップ、編集が飛行中なら撃たない
3. 途中は末尾に `stream.cursor`(既定 `▌`)を添え、最後に外す
4. 最終出力が `display.splitThreshold` を超えたら分割し、2通目以降は `followUp()`

`stream.enabled: false` なら「完成してから1回だけ送る」動作になります。`display.splitThreshold` の既定は `"auto"` で、その呼び出しで実際に使う表示方法から分割位置が決まります(埋め込みなら 4096 文字、プレーンテキストなら 2000 文字)。

### 失敗の扱い

**生成の失敗は throw せず、応答へ表示されます**(すでに Discord の応答を引き受けているため)。検知したい場合は `aiError` を購読するか、戻り値の `error` を見てください。戻り値の `text` にはモデルが返した本文が入り、途中まで生成された分は失敗時も残ります。

例外は「表示を引き受ける前の失敗」です。`promptTooLong` / `cooldown` / `modelNotConfigured` / `promptEmpty` の4つはそのまま throw され、フレームワークの既定処理がプレーンテキスト + Ephemeral で返します(この4つに `display` の設定は効きません。器も揃えたい場合は `commandError` のリスナーを置いてください)。

### メンションは既定で発火しません

モデルの出力はそのまま本文へ流れるので、既定の `display.allowedMentions` は **`{ parse: [] }`(どのメンションも解決しない)** です。プロンプトインジェクションで `@everyone` を書かれても発火しません。許可する場合は明示します。

```ts
ai({ display: { allowedMentions: { parse: ["users"] } } })  // ユーザーだけ許可
ai({ display: { allowedMentions: null } })                  // discord.js の既定に任せる
```

## 設定

指定した項目だけが既定値を上書きします。**ユーザーに見えるもので、ハードコードされて変えられない値はありません**(埋め込みの色は [utils](./utils.md) のテーマか `display.decorate` で変えられます)。期間を取る項目はミリ秒でも `"30s"` / `"1h30m"` のような期間表記でも書け、`false` で無制限です。

```ts
ai({
  model: "google:gemini-2.5-flash",
  instructions: "あなたはこのサーバーの案内役です。",  // 既定のシステム指示
  temperature: 0.3,
  maxSteps: 5,                 // ツール呼び出しを含めて何ステップまで回すか
  timeout: "120s",             // 1回の生成を打ち切るまで
  tools:   { enabled: true, timeout: "30s" },
  memory:  { enabled: true, maxMessages: 20, ttl: "1h" },
  stream:  { enabled: true, intervalMs: 1200, cursor: "▌" },
  limits:  { maxPromptLength: 4000, maxResponseLength: false, cooldown: false },
  display: {
    embeds: true,               // false でプレーンテキスト
    ephemeral: false,
    allowedMentions: { parse: [] },
    decorate: (embed) => embed.setTitle("AI"),   // 埋め込み経路だけ
    payload: (payload, context) => payload,     // 両経路で送信直前に必ず通る
  },
  texts:   { thinking: "考え中…" },
})
```

| グループ | 主な項目(既定) | 意味 |
| --- | --- | --- |
| `tools` | `enabled: true`・`timeout: "30s"` | `ai/` のツールをモデルへ渡すか、1回のツール実行の打ち切り |
| `memory` | `enabled: true`・`maxMessages: 20`・`ttl: "1h"`・`store` | 会話履歴の保持数・有効期間・保存先 |
| `stream` | `enabled: true`・`intervalMs: 1200`・`cursor: "▌"` | 途中経過の編集間隔とカーソル記号 |
| `limits` | `maxPromptLength: 4000`・`maxResponseLength: false`・`cooldown: false` | 入力の上限・応答の切り詰め・連続利用の間隔 |
| `display` | `embeds: true`・`ephemeral: false`・`splitThreshold: "auto"`・`allowedMentions`・`decorate`・`payload` | 応答の見せ方 |
| `texts` | `thinking`・`emptyResponse`・`generationFailed`・`apiCallFailed`・`answerBody` など | ユーザーに見える文言(すべて差し替え可能) |

### クールダウンと払い戻し

`limits.cooldown` は、同じユーザーが続けて `reply()` を呼べるまでの間隔です(既定は無効)。**本文を1文字も届けられなかった失敗は数えません** — モデル未設定やプロバイダー障害などで何も表示できなかった呼び出しは払い戻されます。途中まで表示できた応答は利用として数えます。

### 文言の差し替え

エラー文言を含め、ユーザーに見える文言は `texts` で差し替えられます。HTTP エラーにはステータスコードが添えられるので、言い換えもできます。

```ts
ai({
  texts: {
    apiCallFailed: (status, message) =>
      status === 401 ? "APIキーを確認してください。" : `${message}(HTTP ${status})`,
  },
})
```

本文の組み立てそのもの(回答・引用元・使用ツール・トークン数の並び順や区切り)も `texts.answerBody` で差し替えられます。既定では使用ツールとトークン数は表示されません — 出したい場合にここを使います。

## 注意: function calling 非対応のモデル

**function calling に対応していないモデルへツールを渡すと、エラーも出さずに空の応答が返ることがあります**(実測された OpenAI 互換エンドポイントでは、ツールあり 3/3 で空・ツールなし 3/3 で成功でした)。Bot 側からは `texts.emptyResponse` しか見えず原因が判らないため、本文が空になった場合はツールを何個渡したかがログの警告に残ります。そういうモデルを使うときはツールを切ってください。

```ts
ai({ tools: { enabled: false } })
```

## イベント

`Listener` コンポーネントで型付きのまま観測できます。

| イベント | 引数 |
| --- | --- |
| `aiRequest` | `(request)` |
| `aiResponse` | `(response, request)` |
| `aiToolCall` | `(tool, input, context)` |
| `aiError` | `(error, info)` — `info.phase` は `"generate"` / `"tool"` / `"display"` / `"memory"` |

`aiError` は内部で処理したエラーを知らせます。購読しているリスナーが1つでもいれば、既定動作(ログ)は走りません — フレームワークの `commandError` と同じ形です。ストリーミング中の失敗も必ず届きます(1断片も出ずに失敗した場合は本当の原因が応答と `aiError` の両方に出て、途中まで出てから失敗した場合は回答を残したまま `aiError` に出ます)。

## 互換性

| 項目 | 要件 |
| --- | --- |
| ランタイム | Bun 1.4+ |
| discord.js | v14 |
| フレームワーク | `@cc-discord-framework/core` ^2.0.0(peer dependency) |
| 同梱の依存 | `ai`(Vercel AI SDK)・`zod`・`@cc-discord-framework/utils` |
| optional peer | `@ai-sdk/openai` / `@ai-sdk/anthropic` / `@ai-sdk/google` / `@ai-sdk/openai-compatible` — 使うものだけ `bun add` |
