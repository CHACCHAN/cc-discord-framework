# 関数: buttonTheme()

```ts
function buttonTheme(base, override?): ButtonTheme;
```

定義: [plugins/utils/src/theme.ts:192](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/theme.ts#L192)

ボタンの見た目に部分指定を重ねます。文字列を渡すとラベルだけの
変更になります(`yes: "はい"` のような短い書き方のため)。

既定のラベルを消して **絵文字だけのボタン** にしたい場合は、
`label` を明示的に `undefined` にしてください:

```ts
{ yes: { label: undefined, emoji: "✅" } }
```

## パラメータ

### base

[`ButtonTheme`](../interfaces/ButtonTheme.md)

### override?

`string` \| `Partial`\<[`ButtonTheme`](../interfaces/ButtonTheme.md)\>

## 戻り値

[`ButtonTheme`](../interfaces/ButtonTheme.md)
