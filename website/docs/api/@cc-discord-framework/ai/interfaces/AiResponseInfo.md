# インターフェイス: AiResponseInfo

定義: plugins/ai/src/events.ts:22

生成が終わったときに分かっていること。

## プロパティ

### finishReason \{#finishreason}

```ts
readonly finishReason: string | null;
```

定義: plugins/ai/src/events.ts:28

生成が終わった理由。判らなければ `null`。

***

### text \{#text}

```ts
readonly text: string;
```

定義: plugins/ai/src/events.ts:24

生成された本文。

***

### toolNames \{#toolnames}

```ts
readonly toolNames: readonly string[];
```

定義: plugins/ai/src/events.ts:30

実際に呼ばれたツールの名前(重複なし・呼ばれた順)。

***

### usage \{#usage}

```ts
readonly usage: LanguageModelUsage | null;
```

定義: plugins/ai/src/events.ts:26

トークン数。判らなければ `null`。
