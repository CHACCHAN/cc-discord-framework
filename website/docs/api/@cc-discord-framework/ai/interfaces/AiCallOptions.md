# インターフェイス: AiCallOptions

定義: plugins/ai/src/AiService.ts:45

どのメソッドにも共通のオプション。省略した項目は設定の既定値です。

## によって拡張された

- [`AiGenerateOptions`](AiGenerateOptions.md)

## プロパティ

### abortSignal? \{#abortsignal}

```ts
optional abortSignal?: AbortSignal;
```

定義: plugins/ai/src/AiService.ts:61

***

### context? \{#context}

```ts
optional context?: Partial<AiToolContext>;
```

定義: plugins/ai/src/AiService.ts:70

ツールへ渡すコンテキスト。

***

### history? \{#history}

```ts
optional history?: string | false;
```

定義: plugins/ai/src/AiService.ts:68

会話履歴のキー(チャンネル ID にすればチャンネル単位)。指定すると
履歴を前置きし、生成後に追記します。省略・`false` なら一問一答です。

***

### instructions? \{#instructions}

```ts
optional instructions?: string | null;
```

定義: plugins/ai/src/AiService.ts:49

システム指示。`null` で「指示なし」を明示できます。

***

### maxOutputTokens? \{#maxoutputtokens}

```ts
optional maxOutputTokens?: number;
```

定義: plugins/ai/src/AiService.ts:56

***

### maxSteps? \{#maxsteps}

```ts
optional maxSteps?: number;
```

定義: plugins/ai/src/AiService.ts:58

ツール呼び出しを含めて何ステップまで回すか。

***

### messages? \{#messages}

```ts
optional messages?: ModelMessage[];
```

定義: plugins/ai/src/AiService.ts:72

履歴と入力のあいだへ差し込むメッセージ。

***

### model? \{#model}

```ts
optional model?: AiModelInput;
```

定義: plugins/ai/src/AiService.ts:47

使うモデル。文字列なら同梱リゾルバ(または `registry`)が解決します。

***

### stopWhen? \{#stopwhen}

```ts
optional stopWhen?: 
  | StopCondition<ToolSet>
  | StopCondition<ToolSet>[];
```

定義: plugins/ai/src/AiService.ts:60

停止条件。指定すると `maxSteps` より優先されます。

***

### temperature? \{#temperature}

```ts
optional temperature?: number;
```

定義: plugins/ai/src/AiService.ts:55

***

### timeout? \{#timeout}

```ts
optional timeout?: false | DurationInput;
```

定義: plugins/ai/src/AiService.ts:63

生成を打ち切るまでの時間。`false` で無制限。

***

### tools? \{#tools}

```ts
optional tools?: false | ToolSet;
```

定義: plugins/ai/src/AiService.ts:54

モデルへ渡すツール。省略すると登録済みの [AiTool](../classes/AiTool.md) 全部、
`false` でツールなしになります。
