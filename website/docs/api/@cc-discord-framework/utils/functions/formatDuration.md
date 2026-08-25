# 関数: formatDuration()

```ts
function formatDuration(ms, options?): string;
```

定義: plugins/utils/src/duration.ts:84

時計表記に整形します — 再生位置や残り時間の表示向け。

既定は `defaultTheme.duration.clock` です。**この関数はクライアントを
知らないので `utils({ theme })` は効きません** — Bot 全体の設定を
効かせたい場合は `this.services.ui.formatDuration()` を使ってください。

```ts
formatDuration(83_000);    // "1:23"
formatDuration(3_723_000); // "1:02:03"
```

## パラメータ

### ms

`number`

### options?

[`FormatDurationOptions`](../interfaces/FormatDurationOptions.md) = `{}`

## 戻り値

`string`
