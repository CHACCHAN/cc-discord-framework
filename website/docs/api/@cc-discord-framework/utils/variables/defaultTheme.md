# 変数: defaultTheme

```ts
const defaultTheme: Theme;
```

定義: plugins/utils/src/theme.ts:94

何も指定しないときの見た目。丸ごと差し替えるより、必要な項目だけを
`utils({ theme: { colors: { success: 0x00ffaa } } })` のように
上書きするほうが安全です。
