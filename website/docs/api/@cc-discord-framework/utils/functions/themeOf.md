# 関数: themeOf()

```ts
function themeOf(source): Theme;
```

定義: plugins/utils/src/theme.ts:176

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
