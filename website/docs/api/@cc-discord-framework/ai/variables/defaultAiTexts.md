# 変数: defaultAiTexts

```ts
const defaultAiTexts: AiTexts;
```

定義: [plugins/ai/src/texts.ts:175](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/texts.ts#L175)

何も指定しないときの文言。丸ごと差し替えるより、必要な項目だけを
`ai({ texts: { thinking: "考え中…" } })` のように上書きするほうが安全です。
