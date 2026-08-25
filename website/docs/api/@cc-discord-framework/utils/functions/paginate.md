# 関数: paginate()

```ts
function paginate(target, options): Promise<Message<boolean>>;
```

定義: plugins/utils/src/paginate.ts:148

ページ送り付きのメッセージを送ります。ページが1つだけならボタンは
付きません。

戻り値は送信直後のメッセージで、ページ送り自体はそのあとバック
グラウンドで動き続けます(無操作のまま `timeout` が過ぎるとボタンを
無効化して終了)。

```ts
const pages = chunk(members, 10).map((page, index) =>
  this.services.ui.info(page.join("\n")).setTitle(`メンバー(${index + 1}ページ目)`),
);
await paginate(interaction, { pages });
```

## パラメータ

### target

[`ReplyTarget`](../type-aliases/ReplyTarget.md)

### options

[`PaginateOptions`](../interfaces/PaginateOptions.md)

## 戻り値

`Promise`\<`Message`\<`boolean`\>\>
