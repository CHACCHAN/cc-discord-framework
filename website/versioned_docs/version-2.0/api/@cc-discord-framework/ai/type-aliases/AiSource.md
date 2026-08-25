# 型エイリアス: AiSource

```ts
type AiSource = Awaited<ReturnType<typeof generateText>>["sources"][number];
```

定義: [plugins/ai/src/texts.ts:34](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/texts.ts#L34)

引用元(モデルが Web 検索などで参照した先)。
AI SDK は `Source` 型を公開していないので、結果の型から取り出しています。
