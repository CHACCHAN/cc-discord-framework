# 関数: utils()

```ts
function utils(options?): Plugin;
```

定義: plugins/utils/src/index.ts:65

utils プラグインをインストールします。

テーマはクライアントの `container.theme` に置かれるので、複数
クライアントを立てても設定は混ざりません。追加されるコンポーネント
種別は有効にしても対応するディレクトリが無ければ何も起きません —
`tasks/` を作った時点で動き出します。

## パラメータ

### options?

[`UtilsOptions`](../interfaces/UtilsOptions.md) = `{}`

## 戻り値

[`Plugin`](../../../cc-discord-framework/interfaces/Plugin.md)
