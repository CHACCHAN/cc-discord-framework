# 関数: paginate()

```ts
function paginate(target, options): Promise<Message<boolean>>;
```

定義: [plugins/utils/src/paginate.ts:148](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/paginate.ts#L148)

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
