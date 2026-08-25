# 型エイリアス: AiSource

```ts
type AiSource = Awaited<ReturnType<typeof generateText>>["sources"][number];
```

定義: plugins/ai/src/texts.ts:34

引用元(モデルが Web 検索などで参照した先)。
AI SDK は `Source` 型を公開していないので、結果の型から取り出しています。
