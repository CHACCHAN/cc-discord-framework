# 関数: musicSources()

```ts
function musicSources(options?): Plugin;
```

定義: plugins/music-sources/src/index.ts:118

音源プラグインをインストールします。

`music()` が追加した `resolvers/` と `providers/` の種別へ、
YouTube と SoundCloud のコンポーネントを登録します。`music()` より
**後に** 並べてください。

## パラメータ

### options?

[`MusicSourcesOptions`](../interfaces/MusicSourcesOptions.md) = `{}`

## 戻り値

[`Plugin`](../../../cc-discord-framework/interfaces/Plugin.md)
