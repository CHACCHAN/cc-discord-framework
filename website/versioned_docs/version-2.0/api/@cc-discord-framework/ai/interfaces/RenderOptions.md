# インターフェイス: RenderOptions

定義: [plugins/ai/src/render.ts:40](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/render.ts#L40)

[renderAiPayload](../functions/renderAiPayload.md) の上書き。

## プロパティ

### embeds? \{#embeds}

```ts
optional embeds?: boolean;
```

定義: [plugins/ai/src/render.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/render.ts#L42)

埋め込みで返すか。省略すると `display.embeds`。

***

### index? \{#index}

```ts
optional index?: number;
```

定義: [plugins/ai/src/render.ts:44](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/render.ts#L44)

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

定義: [plugins/ai/src/render.ts:48](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/render.ts#L48)

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

定義: [plugins/ai/src/render.ts:46](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/render.ts#L46)

分割された総通数。`display.payload` へ渡ります。

#### Default

```ts
1
```
