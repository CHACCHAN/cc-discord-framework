# 型エイリアス: Page

```ts
type Page = string | EmbedBuilder | Omit<BaseMessageOptions, "components">;
```

定義: [plugins/utils/src/paginate.ts:26](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/paginate.ts#L26)

1ページ分の内容。文字列・埋め込み・そのままの送信ペイロード。
