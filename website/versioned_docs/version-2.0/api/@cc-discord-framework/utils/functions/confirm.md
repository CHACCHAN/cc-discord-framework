# 関数: confirm()

```ts
function confirm(target, options?): Promise<boolean>;
```

定義: [plugins/utils/src/confirm.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/confirm.ts#L55)

確認ダイアログを出し、押されたボタンを待ちます。
タイムアウト・拒否のどちらも `false` になるので、`if` ひとつで書けます。

```ts
if (!(await confirm(interaction, { content: "全件削除します。よろしいですか?" }))) return;
await purge();
```

ラベル・色・待ち時間は Bot 全体のテーマ(`utils({ theme })`)から取り、
この関数の `options` でその場だけ上書きできます。

## パラメータ

### target

[`ReplyTarget`](../type-aliases/ReplyTarget.md)

### options?

[`ConfirmOptions`](../interfaces/ConfirmOptions.md) = `{}`

## 戻り値

`Promise`\<`boolean`\>
