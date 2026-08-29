# 関数: ai()

```ts
function ai(options?): Plugin;
```

定義: [plugins/ai/src/index.ts:88](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/index.ts#L88)

ai プラグインをインストールします。

`ai/` というコンポーネント種別を追加し、`this.services.ai` を提供します。
**コマンドは登録しません** — Bot の機能は Bot 側で書いてください。

## パラメータ

### options?

[`AiConfigOptions`](../interfaces/AiConfigOptions.md) = `{}`

## 戻り値

[`Plugin`](../../core/interfaces/Plugin.md)
