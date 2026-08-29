# 関数: progressBar()

```ts
function progressBar(
   value, 
   total, 
   options?): string;
```

定義: [plugins/utils/src/text.ts:160](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/text.ts#L160)

進捗バーを作ります — 再生位置、投票、レベルなどの表示に。

```ts
progressBar(30, 100, { width: 10 });                    // "███░░░░░░░"
progressBar(30, 100, { filled: "▬", empty: "―" });      // 見た目を変える
```

既定は `defaultTheme.progress` です。**この関数はクライアントを知らないので
`utils({ theme })` は効きません** — Bot 全体の設定を効かせたい場合は
`this.services.ui.progressBar()` を使ってください。

## パラメータ

### value

`number`

### total

`number`

### options?

[`ProgressBarOptions`](../interfaces/ProgressBarOptions.md) = `{}`

## 戻り値

`string`
