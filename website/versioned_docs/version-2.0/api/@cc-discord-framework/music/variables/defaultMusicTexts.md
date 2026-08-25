# 変数: defaultMusicTexts

```ts
const defaultMusicTexts: MusicTexts;
```

定義: [plugins/music/src/texts.ts:49](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/texts.ts#L49)

何も指定しないときの文言。丸ごと差し替えるより、必要な項目だけを
`music({ texts: { nothingPlaying: "..." } })` のように上書きするほうが
安全です。
