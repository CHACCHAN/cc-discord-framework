# 関数: splitMessage()

```ts
function splitMessage(text, options?): string[];
```

定義: [plugins/utils/src/text.ts:76](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/text.ts#L76)

長文を送信可能な長さへ分割します(discord.js v14 で `Util.splitMessage`
が無くなったため)。区切り文字の位置で切り、それでも収まらない塊だけ
強制的に分割します。

```ts
for (const part of splitMessage(logText)) await channel.send(part);
```

## パラメータ

### text

`string`

### options?

[`SplitMessageOptions`](../interfaces/SplitMessageOptions.md) = `{}`

## 戻り値

`string`[]
