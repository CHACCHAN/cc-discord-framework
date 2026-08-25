# 関数: ai()

```ts
function ai(options?): Plugin;
```

定義: [plugins/ai/src/index.ts:88](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/index.ts#L88)

ai プラグインをインストールします。

`ai/` というコンポーネント種別を追加し、`this.services.ai` を提供します。
**コマンドは登録しません** — Bot の機能は Bot 側で書いてください。

## パラメータ

### options?

[`AiConfigOptions`](../interfaces/AiConfigOptions.md) = `{}`

## 戻り値

[`Plugin`](../../core/interfaces/Plugin.md)
