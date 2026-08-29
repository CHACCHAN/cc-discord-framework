# 関数: utils()

```ts
function utils(options?): Plugin;
```

定義: [plugins/utils/src/index.ts:65](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/index.ts#L65)

utils プラグインをインストールします。

テーマはクライアントの `container.theme` に置かれるので、複数
クライアントを立てても設定は混ざりません。追加されるコンポーネント
種別は有効にしても対応するディレクトリが無ければ何も起きません —
`tasks/` を作った時点で動き出します。

## パラメータ

### options?

[`UtilsOptions`](../interfaces/UtilsOptions.md) = `{}`

## 戻り値

[`Plugin`](../../core/interfaces/Plugin.md)
