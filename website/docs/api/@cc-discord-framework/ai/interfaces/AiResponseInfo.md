# インターフェイス: AiResponseInfo

定義: [plugins/ai/src/events.ts:22](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/events.ts#L22)

生成が終わったときに分かっていること。

## プロパティ

### finishReason \{#finishreason}

```ts
readonly finishReason: string | null;
```

定義: [plugins/ai/src/events.ts:28](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/events.ts#L28)

生成が終わった理由。判らなければ `null`。

***

### text \{#text}

```ts
readonly text: string;
```

定義: [plugins/ai/src/events.ts:24](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/events.ts#L24)

生成された本文。

***

### toolNames \{#toolnames}

```ts
readonly toolNames: readonly string[];
```

定義: [plugins/ai/src/events.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/events.ts#L30)

実際に呼ばれたツールの名前(重複なし・呼ばれた順)。

***

### usage \{#usage}

```ts
readonly usage: LanguageModelUsage | null;
```

定義: [plugins/ai/src/events.ts:26](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/events.ts#L26)

トークン数。判らなければ `null`。
