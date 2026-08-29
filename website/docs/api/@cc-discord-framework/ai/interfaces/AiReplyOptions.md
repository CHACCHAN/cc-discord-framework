# インターフェイス: AiReplyOptions

定義: [plugins/ai/src/AiService.ts:91](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L91)

[AiService.reply](../classes/AiService.md#reply) の引数。

## 拡張

- [`AiGenerateOptions`](AiGenerateOptions.md)

## プロパティ

### abortSignal? \{#abortsignal}

```ts
optional abortSignal?: AbortSignal;
```

定義: [plugins/ai/src/AiService.ts:67](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L67)

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`abortSignal`](AiGenerateOptions.md#abortsignal)

***

### context? \{#context}

```ts
optional context?: Partial<AiToolContext>;
```

定義: [plugins/ai/src/AiService.ts:76](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L76)

ツールへ渡すコンテキスト。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`context`](AiGenerateOptions.md#context)

***

### display? \{#display}

```ts
optional display?: AiDisplayOptions;
```

定義: [plugins/ai/src/AiService.ts:120](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L120)

**この呼び出しだけ** 表示設定をキー単位で上書きします。省略した項目は
`ai({ display })` の設定(それも無ければ既定値)のままです。

```ts
await this.services.ai.reply(interaction, {
  prompt,
  display: {
    decorate: (embed) => embed.setTitle("質問への回答"),
    payload: (payload) => ({ ...payload, components: [row] }),
  },
});
```

***

### embeds? \{#embeds}

```ts
optional embeds?: boolean;
```

定義: [plugins/ai/src/AiService.ts:103](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L103)

埋め込みで返す。`display.embeds` のショートハンドで、両方指定した
場合はこちらが優先です。省略すると `display.embeds`。

***

### ephemeral? \{#ephemeral}

```ts
optional ephemeral?: boolean;
```

定義: [plugins/ai/src/AiService.ts:98](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L98)

本人にだけ見せる。`display.ephemeral` のショートハンドで、両方指定した
場合はこちらが優先です。省略すると `display.ephemeral`。

***

### history? \{#history}

```ts
optional history?: string | false;
```

定義: [plugins/ai/src/AiService.ts:74](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L74)

会話履歴のキー(チャンネル ID にすればチャンネル単位)。指定すると
履歴を前置きし、生成後に追記します。省略・`false` なら一問一答です。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`history`](AiGenerateOptions.md#history)

***

### instructions? \{#instructions}

```ts
optional instructions?: string | null;
```

定義: [plugins/ai/src/AiService.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L55)

システム指示。`null` で「指示なし」を明示できます。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`instructions`](AiGenerateOptions.md#instructions)

***

### kind? \{#kind}

```ts
optional kind?: AiReplyKind;
```

定義: [plugins/ai/src/AiService.ts:105](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L105)

埋め込みの色に使う意味づけ。

***

### maxOutputTokens? \{#maxoutputtokens}

```ts
optional maxOutputTokens?: number;
```

定義: [plugins/ai/src/AiService.ts:62](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L62)

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`maxOutputTokens`](AiGenerateOptions.md#maxoutputtokens)

***

### maxSteps? \{#maxsteps}

```ts
optional maxSteps?: number;
```

定義: [plugins/ai/src/AiService.ts:64](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L64)

ツール呼び出しを含めて何ステップまで回すか。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`maxSteps`](AiGenerateOptions.md#maxsteps)

***

### messages? \{#messages}

```ts
optional messages?: ModelMessage[];
```

定義: [plugins/ai/src/AiService.ts:78](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L78)

履歴と入力のあいだへ差し込むメッセージ。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`messages`](AiGenerateOptions.md#messages)

***

### model? \{#model}

```ts
optional model?: AiModelInput;
```

定義: [plugins/ai/src/AiService.ts:53](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L53)

使うモデル。文字列なら同梱リゾルバ(または `registry`)が解決します。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`model`](AiGenerateOptions.md#model)

***

### prompt \{#prompt}

```ts
prompt: string;
```

定義: [plugins/ai/src/AiService.ts:84](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L84)

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

定義: [plugins/ai/src/AiService.ts:66](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L66)

停止条件。指定すると `maxSteps` より優先されます。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`stopWhen`](AiGenerateOptions.md#stopwhen)

***

### stream? \{#stream}

```ts
optional stream?: boolean;
```

定義: [plugins/ai/src/AiService.ts:93](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L93)

途中経過を編集で見せる。省略すると `stream.enabled`。

***

### temperature? \{#temperature}

```ts
optional temperature?: number;
```

定義: [plugins/ai/src/AiService.ts:61](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L61)

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`temperature`](AiGenerateOptions.md#temperature)

***

### texts? \{#texts}

```ts
optional texts?: Partial<AiTexts>;
```

定義: [plugins/ai/src/AiService.ts:126](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L126)

**この呼び出しだけ** 文言(本文の組み立て [AiTexts.answerBody](AiTexts.md#answerbody) を
含む)を項目単位で上書きします。省略した項目は `ai({ texts })` の設定
のままです。

***

### timeout? \{#timeout}

```ts
optional timeout?: false | DurationInput;
```

定義: [plugins/ai/src/AiService.ts:69](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L69)

生成を打ち切るまでの時間。`false` で無制限。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`timeout`](AiGenerateOptions.md#timeout)

***

### tools? \{#tools}

```ts
optional tools?: false | ToolSet;
```

定義: [plugins/ai/src/AiService.ts:60](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiService.ts#L60)

モデルへ渡すツール。省略すると登録済みの [AiTool](../classes/AiTool.md) 全部、
`false` でツールなしになります。

#### 継承元

[`AiGenerateOptions`](AiGenerateOptions.md).[`tools`](AiGenerateOptions.md#tools)
