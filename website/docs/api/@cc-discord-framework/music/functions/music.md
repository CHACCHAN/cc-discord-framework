# 関数: music()

```ts
function music(options?): Plugin;
```

定義: [plugins/music/src/index.ts:67](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/index.ts#L67)

music プラグインをインストールします。

`resolvers/` と `providers/` の2つのコンポーネント種別を追加し、
`this.services.audio` を提供します。コマンドは登録しません。

## パラメータ

### options?

[`MusicConfigOptions`](../interfaces/MusicConfigOptions.md) = `{}`

## 戻り値

[`Plugin`](../../core/interfaces/Plugin.md)
