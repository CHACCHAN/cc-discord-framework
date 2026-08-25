# 関数: aiConfigOf()

```ts
function aiConfigOf(source): AiConfig;
```

定義: plugins/ai/src/config.ts:397

そのクライアントに設定された ai の設定を取り出します。`ai()` を
入れていない場合や、クライアント以外から呼ばれた場合は既定値です。

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

[`AiConfig`](../interfaces/AiConfig.md)
