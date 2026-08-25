# 関数: looksLikeAudio()

```ts
function looksLikeAudio(pathOrUrl, extensions?): boolean;
```

定義: plugins/music/src/format.ts:41

拡張子から音声ファイルらしいかを判定します。
扱う拡張子は `network.audioExtensions` から渡せます。

## パラメータ

### pathOrUrl

`string`

### extensions?

readonly `string`[] = `DEFAULT_AUDIO_EXTENSIONS`

## 戻り値

`boolean`
