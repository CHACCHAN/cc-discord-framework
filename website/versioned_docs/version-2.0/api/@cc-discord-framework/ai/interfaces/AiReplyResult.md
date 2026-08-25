# インターフェイス: AiReplyResult

定義: [plugins/ai/src/AiService.ts:97](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L97)

[AiService.reply](../classes/AiService.md#reply) の戻り値。

## プロパティ

### edits \{#edits}

```ts
readonly edits: number;
```

定義: [plugins/ai/src/AiService.ts:114](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L114)

実際に送った編集の回数(途中経過 + 最終)。

***

### error \{#error}

```ts
readonly error: unknown;
```

定義: [plugins/ai/src/AiService.ts:118](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L118)

生成に失敗した場合のエラー。成功なら `null`。

***

### finishReason \{#finishreason}

```ts
readonly finishReason: string | null;
```

定義: [plugins/ai/src/AiService.ts:110](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L110)

生成が終わった理由。判らなければ `null`。

***

### followUps \{#followups}

```ts
readonly followUps: number;
```

定義: [plugins/ai/src/AiService.ts:116](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L116)

分割して追加送信した通数。

***

### text \{#text}

```ts
readonly text: string;
```

定義: [plugins/ai/src/AiService.ts:106](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L106)

モデルが返した本文(`limits.maxResponseLength` での切り詰め後)。

**表示された本文とは限りません** — 引用元などの付随情報は
[AiTexts.answerBody](AiTexts.md#answerbody) が足しますし、生成に失敗した場合は
既定ではエラー文言が表示されて、ここには **途中まで生成された本文**
が残ります(失敗して1文字も出ていなければ空文字)。

***

### toolNames \{#toolnames}

```ts
readonly toolNames: readonly string[];
```

定義: [plugins/ai/src/AiService.ts:112](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L112)

実際に呼ばれたツールの名前。

***

### usage \{#usage}

```ts
readonly usage: LanguageModelUsage | null;
```

定義: [plugins/ai/src/AiService.ts:108](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/AiService.ts#L108)

トークン数。判らなければ `null`。
