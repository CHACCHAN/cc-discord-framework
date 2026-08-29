# 関数: humanizeDuration()

```ts
function humanizeDuration(ms, options?): string;
```

定義: [plugins/utils/src/duration.ts:122](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/duration.ts#L122)

大まかな長さとして整形します — クールダウンや稼働時間の表示向け。
時計表記と違い、既定では上位2単位だけを出すので長さがぶれません。

```ts
humanizeDuration(3_723_000);              // "1h 2m"
humanizeDuration(3_723_000, { max: 3 });  // "1h 2m 3s"
humanizeDuration(3_723_000, { units: { h: "時間", m: "分" }, separator: "" }); // "1時間2分"
```

既定は `defaultTheme.duration` です。**この関数はクライアントを知らないので
`utils({ theme })` は効きません** — Bot 全体の設定を効かせたい場合は
`this.services.ui.humanize()` を使ってください。

## パラメータ

### ms

`number`

### options?

[`HumanizeDurationOptions`](../interfaces/HumanizeDurationOptions.md) = `{}`

## 戻り値

`string`
