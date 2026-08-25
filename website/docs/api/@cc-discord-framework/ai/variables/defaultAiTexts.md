# 変数: defaultAiTexts

```ts
const defaultAiTexts: AiTexts;
```

定義: plugins/ai/src/texts.ts:173

何も指定しないときの文言。丸ごと差し替えるより、必要な項目だけを
`ai({ texts: { thinking: "考え中…" } })` のように上書きするほうが安全です。
