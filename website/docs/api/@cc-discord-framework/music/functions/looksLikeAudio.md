# 関数: looksLikeAudio()

```ts
function looksLikeAudio(pathOrUrl, extensions?): boolean;
```

定義: [plugins/music/src/format.ts:41](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/format.ts#L41)

拡張子から音声ファイルらしいかを判定します。
扱う拡張子は `network.audioExtensions` から渡せます。

## パラメータ

### pathOrUrl

`string`

### extensions?

readonly `string`[] = `DEFAULT_AUDIO_EXTENSIONS`

## 戻り値

`boolean`
