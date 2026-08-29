# 変数: defaultTheme

```ts
const defaultTheme: Theme;
```

定義: [plugins/utils/src/theme.ts:94](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/theme.ts#L94)

何も指定しないときの見た目。丸ごと差し替えるより、必要な項目だけを
`utils({ theme: { colors: { success: 0x00ffaa } } })` のように
上書きするほうが安全です。
