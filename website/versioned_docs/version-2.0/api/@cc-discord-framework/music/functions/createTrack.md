# 関数: createTrack()

```ts
function createTrack(input): Track;
```

定義: [plugins/music/src/track.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/track.ts#L30)

[Track](../interfaces/Track.md) を既定値付きで生成します。

## パラメータ

### input

`Pick`\<[`Track`](../interfaces/Track.md), `"url"` \| `"title"` \| `"source"`\> & `Partial`\<[`Track`](../interfaces/Track.md)\>

## 戻り値

[`Track`](../interfaces/Track.md)
