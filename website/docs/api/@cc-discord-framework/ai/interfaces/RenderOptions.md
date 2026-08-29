# インターフェイス: RenderOptions

定義: [plugins/ai/src/render.ts:60](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/render.ts#L60)

[renderAiPayload](../functions/renderAiPayload.md) の上書き。

## プロパティ

### display? \{#display}

```ts
optional display?: AiDisplayOptions;
```

定義: [plugins/ai/src/render.ts:74](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/render.ts#L74)

この呼び出しだけ表示設定をキー単位で上書きします
(`decorate` / `payload` / `allowedMentions` など)。
省略した項目はクライアント設定の `display` のままです。

***

### embeds? \{#embeds}

```ts
optional embeds?: boolean;
```

定義: [plugins/ai/src/render.ts:62](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/render.ts#L62)

埋め込みで返すか。省略すると `display.embeds`。

***

### index? \{#index}

```ts
optional index?: number;
```

定義: [plugins/ai/src/render.ts:64](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/render.ts#L64)

分割された何通目か(1始まり)。`display.payload` へ渡ります。

#### Default

```ts
1
```

***

### streaming? \{#streaming}

```ts
optional streaming?: boolean;
```

定義: [plugins/ai/src/render.ts:68](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/render.ts#L68)

途中経過か。`display.payload` へ渡ります。

#### Default

```ts
false
```

***

### total? \{#total}

```ts
optional total?: number;
```

定義: [plugins/ai/src/render.ts:66](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/render.ts#L66)

分割された総通数。`display.payload` へ渡ります。

#### Default

```ts
1
```
