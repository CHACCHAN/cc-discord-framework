# 関数: renderAiPayload()

```ts
function renderAiPayload(
   source, 
   body, 
   kind?, 
   options?): AiMessagePayload;
```

定義: [plugins/ai/src/render.ts:89](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/render.ts#L89)

本文を送信ペイロードにします。

`source` にはインタラクションかメッセージを渡してください — そこから
クライアントを辿って設定とテーマを解決するので、呼び出し側が設定を
持ち回る必要がありません。

メンションの解決範囲は `display.allowedMentions`(既定は
`{ parse: [] }` = どのメンションも解決しない)から入ります。
モデルの出力をそのまま `content` に流すため、**既定では `@everyone` を
書かれても発火しません**。

## パラメータ

### source

  \| \{
  `client?`: `unknown`;
\}
  \| `null`
  \| `undefined`

### body

`string`

### kind?

[`AiReplyKind`](../type-aliases/AiReplyKind.md) = `"info"`

### options?

[`RenderOptions`](../interfaces/RenderOptions.md) = `{}`

## 戻り値

[`AiMessagePayload`](../type-aliases/AiMessagePayload.md)
