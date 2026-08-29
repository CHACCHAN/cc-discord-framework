# 関数: guessStreamType()

```ts
function guessStreamType(pathOrUrl, contentType?): StreamType;
```

定義: [plugins/music/src/format.ts:20](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/format.ts#L20)

パスや URL の拡張子から [StreamType](https://discord.js.org/docs/packages/voice/main/StreamType:Enum) を推定します。

opus をそのまま含むコンテナ(`.opus` / `.webm`)は変換せずに送れるため
ffmpeg も opus エンコードも不要になります。それ以外は `Arbitrary` を
返し、ffmpeg での変換が必要になります。

`.ogg` は Vorbis の可能性があるため、あえて `Arbitrary` にしています。

## パラメータ

### pathOrUrl

`string`

### contentType?

`string` \| `null`

## 戻り値

[`StreamType`](https://discord.js.org/docs/packages/voice/main/StreamType:Enum)
