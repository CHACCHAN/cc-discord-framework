# 関数: music()

```ts
function music(options?): Plugin;
```

定義: plugins/music/src/index.ts:67

music プラグインをインストールします。

`resolvers/` と `providers/` の2つのコンポーネント種別を追加し、
`this.services.audio` を提供します。コマンドは登録しません。

## パラメータ

### options?

[`MusicConfigOptions`](../interfaces/MusicConfigOptions.md) = `{}`

## 戻り値

[`Plugin`](../../../cc-discord-framework/interfaces/Plugin.md)
