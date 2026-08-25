# 関数: truncate()

```ts
function truncate(
   text, 
   max, 
   suffix?): string;
```

定義: [plugins/utils/src/text.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/text.ts#L30)

上限を超える文字列を切り詰めます。埋め込みやフィールドの制限に
引っかかってエラーになるのを防ぐためのものです。

```ts
truncate("とても長い説明文...", 10);          // "とても長い説明文…"
truncate("とても長い説明文...", 10, "...");   // 末尾を変える
```

末尾の既定は `defaultTheme.text.ellipsis` です。**この関数は
クライアントを知らないので `utils({ theme })` は効きません** —
Bot 全体の設定を効かせたい場合は `this.services.ui.truncate()` を
使ってください。

## パラメータ

### text

`string`

### max

`number`

### suffix?

`string` = `defaultTheme.text.ellipsis`

## 戻り値

`string`
