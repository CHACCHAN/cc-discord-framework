# インターフェイス: AiGenerateOptions

定義: plugins/ai/src/AiService.ts:76

[AiService.generate](../classes/AiService.md#generate) の引数。

## 拡張

- [`AiCallOptions`](AiCallOptions.md)

## によって拡張された

- [`AiReplyOptions`](AiReplyOptions.md)

## プロパティ

### abortSignal? \{#abortsignal}

```ts
optional abortSignal?: AbortSignal;
```

定義: plugins/ai/src/AiService.ts:61

#### 継承元

[`AiCallOptions`](AiCallOptions.md).[`abortSignal`](AiCallOptions.md#abortsignal)

***

### context? \{#context}

```ts
optional context?: Partial<AiToolContext>;
```

定義: plugins/ai/src/AiService.ts:70

ツールへ渡すコンテキスト。

#### 継承元

[`AiCallOptions`](AiCallOptions.md).[`context`](AiCallOptions.md#context)

***

### history? \{#history}

```ts
optional history?: string | false;
```

定義: plugins/ai/src/AiService.ts:68

会話履歴のキー(チャンネル ID にすればチャンネル単位)。指定すると
履歴を前置きし、生成後に追記します。省略・`false` なら一問一答です。

#### 継承元

[`AiCallOptions`](AiCallOptions.md).[`history`](AiCallOptions.md#history)

***

### instructions? \{#instructions}

```ts
optional instructions?: string | null;
```

定義: plugins/ai/src/AiService.ts:49

システム指示。`null` で「指示なし」を明示できます。

#### 継承元

[`AiCallOptions`](AiCallOptions.md).[`instructions`](AiCallOptions.md#instructions)

***

### maxOutputTokens? \{#maxoutputtokens}

```ts
optional maxOutputTokens?: number;
```

定義: plugins/ai/src/AiService.ts:56

#### 継承元

[`AiCallOptions`](AiCallOptions.md).[`maxOutputTokens`](AiCallOptions.md#maxoutputtokens)

***

### maxSteps? \{#maxsteps}

```ts
optional maxSteps?: number;
```

定義: plugins/ai/src/AiService.ts:58

ツール呼び出しを含めて何ステップまで回すか。

#### 継承元

[`AiCallOptions`](AiCallOptions.md).[`maxSteps`](AiCallOptions.md#maxsteps)

***

### messages? \{#messages}

```ts
optional messages?: ModelMessage[];
```

定義: plugins/ai/src/AiService.ts:72

履歴と入力のあいだへ差し込むメッセージ。

#### 継承元

[`AiCallOptions`](AiCallOptions.md).[`messages`](AiCallOptions.md#messages)

***

### model? \{#model}

```ts
optional model?: AiModelInput;
```

定義: plugins/ai/src/AiService.ts:47

使うモデル。文字列なら同梱リゾルバ(または `registry`)が解決します。

#### 継承元

[`AiCallOptions`](AiCallOptions.md).[`model`](AiCallOptions.md#model)

***

### prompt \{#prompt}

```ts
prompt: string;
```

定義: plugins/ai/src/AiService.ts:78

ユーザーの入力。

***

### stopWhen? \{#stopwhen}

```ts
optional stopWhen?: 
  | StopCondition<ToolSet>
  | StopCondition<ToolSet>[];
```

定義: plugins/ai/src/AiService.ts:60

停止条件。指定すると `maxSteps` より優先されます。

#### 継承元

[`AiCallOptions`](AiCallOptions.md).[`stopWhen`](AiCallOptions.md#stopwhen)

***

### temperature? \{#temperature}

```ts
optional temperature?: number;
```

定義: plugins/ai/src/AiService.ts:55

#### 継承元

[`AiCallOptions`](AiCallOptions.md).[`temperature`](AiCallOptions.md#temperature)

***

### timeout? \{#timeout}

```ts
optional timeout?: false | DurationInput;
```

定義: plugins/ai/src/AiService.ts:63

生成を打ち切るまでの時間。`false` で無制限。

#### 継承元

[`AiCallOptions`](AiCallOptions.md).[`timeout`](AiCallOptions.md#timeout)

***

### tools? \{#tools}

```ts
optional tools?: false | ToolSet;
```

定義: plugins/ai/src/AiService.ts:54

モデルへ渡すツール。省略すると登録済みの [AiTool](../classes/AiTool.md) 全部、
`false` でツールなしになります。

#### 継承元

[`AiCallOptions`](AiCallOptions.md).[`tools`](AiCallOptions.md#tools)
