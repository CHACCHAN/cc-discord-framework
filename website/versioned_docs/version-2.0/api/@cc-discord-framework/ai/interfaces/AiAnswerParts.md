# インターフェイス: AiAnswerParts

定義: [plugins/ai/src/texts.ts:48](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/texts.ts#L48)

[AiTexts.answerBody](AiTexts.md#answerbody) に渡る断片。

整形済みの文字列と生の値の両方が入るので、既定の整形を流用することも、
生の値から作り直すこともできます。

## プロパティ

### answer \{#answer}

```ts
readonly answer: string;
```

定義: [plugins/ai/src/texts.ts:50](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/texts.ts#L50)

モデルが返した本文(ストリーミング中は途中まで)。空のこともあります。

***

### cursor \{#cursor}

```ts
readonly cursor: string | null;
```

定義: [plugins/ai/src/texts.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/texts.ts#L55)

ストリーミング中に本文の末尾へ添える記号
([AiStreamConfig.cursor](AiStreamConfig.md#cursor))。最後の1回と非ストリーミング時は `null`。

***

### failure \{#failure}

```ts
readonly failure: string | null;
```

定義: [plugins/ai/src/texts.ts:79](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/texts.ts#L79)

生成が失敗したときの、整形済みのエラー文言
([AiTexts.generationFailed](AiTexts.md#generationfailed) を通したもの)。成功なら `null`。

**失敗した場合もこの関数が呼ばれます。** `answer` には途中まで
生成された本文が残っているので、「途中までの回答を残してエラーを
添える」も「失敗時もヘッダーを付ける」もここで書けます。
既定の実装は `failure` だけを出します。

***

### rawSources \{#rawsources}

```ts
readonly rawSources: readonly LanguageModelV4Source[];
```

定義: [plugins/ai/src/texts.ts:63](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/texts.ts#L63)

引用元(生の値)。

***

### rawTools \{#rawtools}

```ts
readonly rawTools: readonly string[];
```

定義: [plugins/ai/src/texts.ts:65](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/texts.ts#L65)

呼ばれたツール名(生の値・重複なし・呼ばれた順)。

***

### rawUsage \{#rawusage}

```ts
readonly rawUsage: LanguageModelUsage | null;
```

定義: [plugins/ai/src/texts.ts:67](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/texts.ts#L67)

トークン数(生の値)。判らなければ `null`。

***

### sources \{#sources}

```ts
readonly sources: readonly string[];
```

定義: [plugins/ai/src/texts.ts:57](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/texts.ts#L57)

[AiTexts.sourceLine](AiTexts.md#sourceline) で整形済みの引用元。無ければ空配列。

***

### streaming \{#streaming}

```ts
readonly streaming: boolean;
```

定義: [plugins/ai/src/texts.ts:69](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/texts.ts#L69)

まだ生成中か。最後の1回だけ `false` になります。

***

### tools \{#tools}

```ts
readonly tools: readonly string[];
```

定義: [plugins/ai/src/texts.ts:59](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/texts.ts#L59)

[AiTexts.toolLine](AiTexts.md#toolline) で整形済みの、呼ばれたツール。無ければ空配列。

***

### usage \{#usage}

```ts
readonly usage: string | null;
```

定義: [plugins/ai/src/texts.ts:61](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/texts.ts#L61)

[AiTexts.usageLine](AiTexts.md#usageline) で整形済みのトークン数。判らなければ `null`。
