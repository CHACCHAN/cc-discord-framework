# インターフェイス: RenderOptions

定義: plugins/ai/src/render.ts:40

[renderAiPayload](../functions/renderAiPayload.md) の上書き。

## プロパティ

### embeds? \{#embeds}

```ts
optional embeds?: boolean;
```

定義: plugins/ai/src/render.ts:42

埋め込みで返すか。省略すると `display.embeds`。

***

### index? \{#index}

```ts
optional index?: number;
```

定義: plugins/ai/src/render.ts:44

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

定義: plugins/ai/src/render.ts:48

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

定義: plugins/ai/src/render.ts:46

分割された総通数。`display.payload` へ渡ります。

#### Default

```ts
1
```
