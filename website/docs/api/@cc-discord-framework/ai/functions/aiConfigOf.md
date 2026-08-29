# 関数: aiConfigOf()

```ts
function aiConfigOf(source): AiConfig;
```

定義: [plugins/ai/src/config.ts:422](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L422)

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
