# 関数: mergeAiDisplay()

```ts
function mergeAiDisplay(display, overrides): AiDisplayConfig;
```

定義: [plugins/ai/src/config.ts:372](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L372)

表示設定に呼び出し単位の上書きをキー単位で重ねます。

[AiService.reply](../classes/AiService.md#reply) の `display` オプションと [renderAiPayload](renderAiPayload.md) が
使います。`allowedMentions` は `null` が「discord.js の既定に任せる」という
意味を持つため、`undefined` のときだけ設定側の値を使います。

## パラメータ

### display

[`AiDisplayConfig`](../interfaces/AiDisplayConfig.md)

### overrides

[`AiDisplayOptions`](../interfaces/AiDisplayOptions.md) \| `undefined`

## 戻り値

[`AiDisplayConfig`](../interfaces/AiDisplayConfig.md)
