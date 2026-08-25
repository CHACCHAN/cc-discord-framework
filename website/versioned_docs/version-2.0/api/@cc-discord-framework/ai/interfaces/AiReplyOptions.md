# インターフェイス: AiReplyOptions

定義: [plugins/ai/src/AiService.ts:85](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L85)

[AiService.reply](../classes/AiService.md#reply) の引数。

## 拡張

- [`AiGenerateOptions`](AiGenerateOptions.md)

## プロパティ

### abortSignal? \{#abortsignal}

```ts
optional abortSignal?: AbortSignal;
```

定義: [plugins/ai/src/AiService.ts:61](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L61)

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`abortSignal`](AiGenerateOptions.md#abortsignal)

***

### context? \{#context}

```ts
optional context?: Partial<AiToolContext>;
```

定義: [plugins/ai/src/AiService.ts:70](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L70)

ツールへ渡すコンテキスト。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`context`](AiGenerateOptions.md#context)

***

### embeds? \{#embeds}

```ts
optional embeds?: boolean;
```

定義: [plugins/ai/src/AiService.ts:91](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L91)

埋め込みで返す。省略すると `display.embeds`。

***

### ephemeral? \{#ephemeral}

```ts
optional ephemeral?: boolean;
```

定義: [plugins/ai/src/AiService.ts:89](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L89)

本人にだけ見せる。省略すると `display.ephemeral`。

***

### history? \{#history}

```ts
optional history?: string | false;
```

定義: [plugins/ai/src/AiService.ts:68](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L68)

会話履歴のキー(チャンネル ID にすればチャンネル単位)。指定すると
履歴を前置きし、生成後に追記します。省略・`false` なら一問一答です。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`history`](AiGenerateOptions.md#history)

***

### instructions? \{#instructions}

```ts
optional instructions?: string | null;
```

定義: [plugins/ai/src/AiService.ts:49](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L49)

システム指示。`null` で「指示なし」を明示できます。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`instructions`](AiGenerateOptions.md#instructions)

***

### kind? \{#kind}

```ts
optional kind?: AiReplyKind;
```

定義: [plugins/ai/src/AiService.ts:93](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L93)

埋め込みの色に使う意味づけ。

***

### maxOutputTokens? \{#maxoutputtokens}

```ts
optional maxOutputTokens?: number;
```

定義: [plugins/ai/src/AiService.ts:56](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L56)

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`maxOutputTokens`](AiGenerateOptions.md#maxoutputtokens)

***

### maxSteps? \{#maxsteps}

```ts
optional maxSteps?: number;
```

定義: [plugins/ai/src/AiService.ts:58](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L58)

ツール呼び出しを含めて何ステップまで回すか。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`maxSteps`](AiGenerateOptions.md#maxsteps)

***

### messages? \{#messages}

```ts
optional messages?: ModelMessage[];
```

定義: [plugins/ai/src/AiService.ts:72](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L72)

履歴と入力のあいだへ差し込むメッセージ。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`messages`](AiGenerateOptions.md#messages)

***

### model? \{#model}

```ts
optional model?: AiModelInput;
```

定義: [plugins/ai/src/AiService.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L47)

使うモデル。文字列なら同梱リゾルバ(または `registry`)が解決します。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`model`](AiGenerateOptions.md#model)

***

### prompt \{#prompt}

```ts
prompt: string;
```

定義: [plugins/ai/src/AiService.ts:78](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L78)

ユーザーの入力。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`prompt`](AiGenerateOptions.md#prompt)

***

### stopWhen? \{#stopwhen}

```ts
optional stopWhen?: 
  | StopCondition<ToolSet>
  | StopCondition<ToolSet>[];
```

定義: [plugins/ai/src/AiService.ts:60](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L60)

停止条件。指定すると `maxSteps` より優先されます。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`stopWhen`](AiGenerateOptions.md#stopwhen)

***

### stream? \{#stream}

```ts
optional stream?: boolean;
```

定義: [plugins/ai/src/AiService.ts:87](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L87)

途中経過を編集で見せる。省略すると `stream.enabled`。

***

### temperature? \{#temperature}

```ts
optional temperature?: number;
```

定義: [plugins/ai/src/AiService.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L55)

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`temperature`](AiGenerateOptions.md#temperature)

***

### timeout? \{#timeout}

```ts
optional timeout?: false | DurationInput;
```

定義: [plugins/ai/src/AiService.ts:63](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L63)

生成を打ち切るまでの時間。`false` で無制限。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`timeout`](AiGenerateOptions.md#timeout)

***

### tools? \{#tools}

```ts
optional tools?: false | ToolSet;
```

定義: [plugins/ai/src/AiService.ts:54](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L54)

モデルへ渡すツール。省略すると登録済みの [AiTool](../classes/AiTool.md) 全部、
`false` でツールなしになります。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`tools`](AiGenerateOptions.md#tools)
