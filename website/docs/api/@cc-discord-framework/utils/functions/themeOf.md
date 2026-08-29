# 関数: themeOf()

```ts
function themeOf(source): Theme;
```

定義: [plugins/utils/src/theme.ts:176](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/theme.ts#L176)

そのクライアントに設定されたテーマを取り出します。`utils()` を
入れていない場合や、クライアント以外から呼ばれた場合は既定値です。

これがあるおかげで、`confirm()` や `paginate()` は「どのクライアントの
呼び出しか」をインタラクション経由で自分で判断でき、利用者が毎回
テーマを渡す必要がありません。

## パラメータ

### source

  \| \{
  `client?`: `unknown`;
\}
  \| `null`
  \| `undefined`

## 戻り値

[`Theme`](../interfaces/Theme.md)
