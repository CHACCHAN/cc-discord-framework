# 型エイリアス: AiReplyKind

```ts
type AiReplyKind = "success" | "info" | "warning" | "error";
```

定義: [plugins/ai/src/texts.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/texts.ts#L42)

応答の意味づけ。埋め込みの色に反映されます(utils テーマの4色に対応)。
`"error"` は生成に失敗したことを応答へ表示するときに使われます。
`"warning"` は同梱機能では使いませんが、`reply({ kind: "warning" })` の
ように呼び出し側から選べます。
