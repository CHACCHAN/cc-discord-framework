# 変数: defaultClientTexts

```ts
const defaultClientTexts: ClientTexts;
```

定義: src/texts.ts:38

何も指定しないときの文言。丸ごと差し替えるより、必要な項目だけを
`new Client({ texts: { guildOnly: "..." } })` のように上書きするほうが
安全です。
