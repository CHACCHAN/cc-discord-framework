# 変数: defaultMusicTexts

```ts
const defaultMusicTexts: MusicTexts;
```

定義: plugins/music/src/texts.ts:49

何も指定しないときの文言。丸ごと差し替えるより、必要な項目だけを
`music({ texts: { nothingPlaying: "..." } })` のように上書きするほうが
安全です。
