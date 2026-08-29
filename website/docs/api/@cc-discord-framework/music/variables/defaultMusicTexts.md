# 変数: defaultMusicTexts

```ts
const defaultMusicTexts: MusicTexts;
```

定義: [plugins/music/src/texts.ts:49](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/texts.ts#L49)

何も指定しないときの文言。丸ごと差し替えるより、必要な項目だけを
`music({ texts: { nothingPlaying: "..." } })` のように上書きするほうが
安全です。
