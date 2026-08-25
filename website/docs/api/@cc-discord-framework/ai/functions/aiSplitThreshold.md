# 関数: aiSplitThreshold()

```ts
function aiSplitThreshold(display, embeds): number;
```

定義: plugins/ai/src/config.ts:378

その呼び出しで実際に使う分割位置を返します。

`display.splitThreshold` が数値ならそれを、`"auto"`(既定)なら
**その呼び出しで実際に使う表示方法**(埋め込みなら 4096、プレーン
テキストなら 2000)から算出します。`reply(interaction, { embeds: false })`
のように呼び出しごとに表示方法を変えても、分割位置がずれません。

明示した値でも、表示方法の上限(埋め込みなら 4096、プレーンテキスト
なら 2000)を超えた分は上限に丸めます — 超えた指定は discord.js が
送信時に必ず拒否するので、様式の選択ではなく **回答が丸ごと失われる**
だけだからです。

## パラメータ

### display

[`AiDisplayConfig`](../interfaces/AiDisplayConfig.md)

### embeds

`boolean`

## 戻り値

`number`
