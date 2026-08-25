# 関数: musicConfigOf()

```ts
function musicConfigOf(source): MusicConfig;
```

定義: plugins/music/src/config.ts:186

そのクライアントに設定された music の設定を取り出します。
`music()` を入れていない場合や、クライアント以外から呼ばれた場合は既定値です。

これがあるおかげで、インタラクションしか受け取らないヘルパーでも
「どのクライアントの呼び出しか」を自分で判断でき、利用者が毎回
設定を渡す必要がありません。

## パラメータ

### source

  \| \{
  `client?`: `unknown`;
\}
  \| `null`
  \| `undefined`

## 戻り値

[`MusicConfig`](../interfaces/MusicConfig.md)
