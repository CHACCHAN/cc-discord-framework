# 変数: defaultClientTexts

```ts
const defaultClientTexts: ClientTexts;
```

定義: [src/texts.ts:38](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/texts.ts#L38)

何も指定しないときの文言。丸ごと差し替えるより、必要な項目だけを
`new Client({ texts: { guildOnly: "..." } })` のように上書きするほうが
安全です。
