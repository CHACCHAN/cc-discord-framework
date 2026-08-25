# クラス: AiService

定義: [plugins/ai/src/AiService.ts:160](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L160)

AI 機能のエントリポイント。`this.services.ai` で参照できます。

```ts
const answer = await this.services.ai.ask("この Bot の作者は?");
await this.services.ai.reply(interaction, { prompt: query, history: interaction.channelId });
```

どのメソッドも、省略した項目は `ai({ ... })` の設定へフォールバックします。

## 拡張

- [`Service`](../../core/classes/Service.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new AiService(): AiService;
```

#### 戻り値

`AiService`

#### 継承元

[`Service`](../../core/classes/Service.md).[`constructor`](../../core/classes/Service.md#constructor)

## プロパティ

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/Component.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L30)

フレームワーク共有サービスを持つコンテナ。

#### 継承元

[`Service`](../../core/classes/Service.md).[`container`](../../core/classes/Service.md#container)

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: [src/component/Component.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L39)

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

#### 継承元

[`Service`](../../core/classes/Service.md).[`location`](../../core/classes/Service.md#location)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/Component.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L36)

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

#### 継承元

[`Service`](../../core/classes/Service.md).[`logger`](../../core/classes/Service.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/Component.ts:27](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L27)

ストア内で一意なコンポーネント名。

#### 継承元

[`Service`](../../core/classes/Service.md).[`name`](../../core/classes/Service.md#name)

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: [src/component/Component.ts:33](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L33)

このコンポーネントが属するストア。

#### 継承元

[`Service`](../../core/classes/Service.md).[`store`](../../core/classes/Service.md#store)

## アクセッサー

### client \{#client}

#### 署名を取得する

```ts
get client(): Client;
```

定義: [src/component/Component.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L42)

フレームワーククライアント。

##### 戻り値

[`Client`](../../core/classes/Client.md)

#### 継承元

[`Service`](../../core/classes/Service.md).[`client`](../../core/classes/Service.md#client)

***

### config \{#config}

#### 署名を取得する

```ts
get config(): AiConfig;
```

定義: [plugins/ai/src/AiService.ts:167](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L167)

このクライアントの ai 設定。

##### 戻り値

[`AiConfig`](../interfaces/AiConfig.md)

***

### memory \{#memory}

#### 署名を取得する

```ts
get memory(): AiMemoryStore;
```

定義: [plugins/ai/src/AiService.ts:175](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L175)

会話履歴の置き場。`memory.store` を指定していればそれ、
指定していなければ Map ベースの既定実装です。

##### 戻り値

[`AiMemoryStore`](../interfaces/AiMemoryStore.md)

***

### services \{#services}

#### 署名を取得する

```ts
get services(): Services;
```

定義: [src/component/Component.ts:50](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L50)

ロード済みサービスへのアクセス(`services/` から自動収束)。
import せずに `this.services.<名前>` で参照できます。

##### 戻り値

[`Services`](../../core/interfaces/Services.md)

#### 継承元

[`Service`](../../core/classes/Service.md).[`services`](../../core/classes/Service.md#services)

## メソッド

### ask() \{#ask}

```ts
ask(prompt, options?): Promise<string>;
```

定義: [plugins/ai/src/AiService.ts:218](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L218)

一問一答。本文だけを返します。

#### パラメータ

##### prompt

`string`

##### options?

[`AiCallOptions`](../interfaces/AiCallOptions.md) = `{}`

#### 戻り値

`Promise`\<`string`\>

***

### forget() \{#forget}

```ts
forget(key): Promise<boolean>;
```

定義: [plugins/ai/src/AiService.ts:587](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L587)

そのキーの会話履歴を消します。消すものがあったかを返します。
`reply()` / `generate()` の `history` に渡したのと同じキーを渡してください。

#### パラメータ

##### key

`string`

#### 戻り値

`Promise`\<`boolean`\>

***

### generate() \{#generate}

```ts
generate(options): Promise<GenerateTextResult<ToolSet, Context, Output<any, any, any>>>;
```

定義: [plugins/ai/src/AiService.ts:227](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L227)

`generateText` の薄いラッパ。結果をそのまま返します。
`history` を指定した場合は、終わったあとに履歴へ追記します。

#### パラメータ

##### options

[`AiGenerateOptions`](../interfaces/AiGenerateOptions.md)

#### 戻り値

`Promise`\<`GenerateTextResult`\<[`ToolSet`](https://ai-sdk.dev/docs/reference/ai-sdk-core), `Context`, `Output`\<`any`, `any`, `any`\>\>\>

***

### history() \{#history}

```ts
history(key): Promise<ModelMessage[]>;
```

定義: [plugins/ai/src/AiService.ts:576](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L576)

そのキーの会話履歴を古い順に返します。キーは呼び出し側が決めます
(チャンネル ID にすればチャンネル単位、`"<チャンネル>:<ユーザー>"`
にすればユーザー単位)。
`memory.maxMessages` を超える分と、`memory.enabled: false` のときは空です。

#### パラメータ

##### key

`string`

#### 戻り値

`Promise`\<`ModelMessage`[]\>

***

### model() \{#model}

```ts
model(id?): Promise<LanguageModel>;
```

定義: [plugins/ai/src/AiService.ts:189](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L189)

モデル指定を解決します。省略すると `ai({ model })` の既定を使い、
それも無ければ [ModelNotConfiguredError](ModelNotConfiguredError.md) を投げます。

#### パラメータ

##### id?

[`AiModelInput`](../type-aliases/AiModelInput.md)

#### 戻り値

`Promise`\<[`LanguageModel`](https://ai-sdk.dev/docs/reference/ai-sdk-core)\>

***

### object() \{#object}

```ts
object<SCHEMA>(
   schema, 
   prompt, 
options?): Promise<InferSchema<SCHEMA>>;
```

定義: [plugins/ai/src/AiService.ts:258](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L258)

`generateObject` で構造化データを取り出します。

#### 型パラメーター

##### SCHEMA

`SCHEMA` *extends* `FlexibleSchema`

#### パラメータ

##### schema

`SCHEMA`

##### prompt

`string`

##### options?

[`AiCallOptions`](../interfaces/AiCallOptions.md) = `{}`

#### 戻り値

`Promise`\<`InferSchema`\<`SCHEMA`\>\>

***

### onLoad()? \{#onload}

```ts
optional onLoad(): unknown;
```

定義: [src/component/Component.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L55)

初期化後・ストア追加前に呼ばれます。

#### 戻り値

`unknown`

#### 継承元

[`Service`](../../core/classes/Service.md).[`onLoad`](../../core/classes/Service.md#onload)

***

### onUnload() \{#onunload}

```ts
onUnload(): void;
```

定義: [plugins/ai/src/AiService.ts:593](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L593)

ストアから取り除かれるときに呼ばれます(クライアント終了時を含む)。

#### 戻り値

`void`

#### 上書き

[`Service`](../../core/classes/Service.md).[`onUnload`](../../core/classes/Service.md#onunload)

***

### reply() \{#reply}

```ts
reply(target, options): Promise<AiReplyResult>;
```

定義: [plugins/ai/src/AiService.ts:323](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L323)

Discord へ **ストリーミング表示しながら** 答えます。

1. まだなら `deferReply()`(メッセージ宛なら仮のメッセージを送信)
2. 生成しながら `stream.intervalMs` ごとに1回だけ編集
   (前回と同じ内容ならスキップ・編集が飛行中ならスキップ)
3. 途中経過が `display.splitThreshold` を超えたら **切り詰める**
   (進捗表示なので分割はしません)
4. 完了したら最終の内容へ編集し、超えていれば **分割して** 追加送信

`stream.enabled: false` なら「完成してから1回だけ送る」動作になります。

`display.splitThreshold` を明示していない場合、分割位置は
**この呼び出しで実際に使う `embeds`** から決まります。

**生成の失敗は throw せず、応答へ表示します**(すでに Discord の応答を
引き受けているため)。検知したい場合は `aiError` を購読するか、
戻り値の `error` を見てください。入力が長すぎる・クールダウン中・
モデル未設定といった **表示を引き受ける前の失敗** はそのまま throw
するので、フレームワークの既定処理が返信します。

#### パラメータ

##### target

[`AiReplyTarget`](../type-aliases/AiReplyTarget.md)

##### options

[`AiReplyOptions`](../interfaces/AiReplyOptions.md)

#### 戻り値

`Promise`\<[`AiReplyResult`](../interfaces/AiReplyResult.md)\>

***

### stream() \{#stream}

```ts
stream(options): Promise<StreamTextResult<ToolSet, Context, Output<any, any, any>>>;
```

定義: [plugins/ai/src/AiService.ts:245](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L245)

`streamText` の薄いラッパ。結果をそのまま返します。

**履歴の追記は行いません** — いつ生成が終わるかは、ストリームを
読んでいる呼び出し側にしか判らないためです。追記したい場合は
`this.services.ai.memory.append(key, ...)` を使うか、
表示まで面倒を見る [AiService.reply](#reply) を使ってください。

#### パラメータ

##### options

[`AiGenerateOptions`](../interfaces/AiGenerateOptions.md)

#### 戻り値

`Promise`\<`StreamTextResult`\<[`ToolSet`](https://ai-sdk.dev/docs/reference/ai-sdk-core), `Context`, `Output`\<`any`, `any`, `any`\>\>\>

***

### tools() \{#tools}

```ts
tools(context?): ToolSet;
```

定義: [plugins/ai/src/AiService.ts:207](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L207)

登録済みの [AiTool](AiTool.md) から `ToolSet` を作ります。
`tools.enabled: false` なら空です。

#### パラメータ

##### context?

`Partial`\<[`AiToolContext`](../interfaces/AiToolContext.md)\> = `{}`

#### 戻り値

[`ToolSet`](https://ai-sdk.dev/docs/reference/ai-sdk-core)

***

### define() \{#define}

```ts
static define(options?): (_target, context) => void;
```

定義: [src/service/Service.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/service/Service.ts#L47)

サービスのメタデータを宣言します。省略可能です。

#### パラメータ

##### options?

[`ServiceOptions`](../../core/interfaces/ServiceOptions.md) = `{}`

#### 戻り値

(`_target`, `context`) => `void`

#### 継承元

[`Service`](../../core/classes/Service.md).[`define`](../../core/classes/Service.md#define)
