# 変数: defaultClientTexts

```ts
const defaultClientTexts: ClientTexts;
```

定義: [src/texts.ts:38](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/texts.ts#L38)

何も指定しないときの文言。丸ごと差し替えるより、必要な項目だけを
`new Client({ texts: { guildOnly: "..." } })` のように上書きするほうが
安全です。
