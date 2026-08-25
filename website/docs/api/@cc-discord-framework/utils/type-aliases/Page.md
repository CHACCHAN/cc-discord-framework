# 型エイリアス: Page

```ts
type Page = string | EmbedBuilder | Omit<BaseMessageOptions, "components">;
```

定義: plugins/utils/src/paginate.ts:26

1ページ分の内容。文字列・埋め込み・そのままの送信ペイロード。
