# 関数: parseYouTubeUrl()

```ts
function parseYouTubeUrl(query): YouTubeTarget | null;
```

定義: [plugins/music-sources/src/youtube/url.ts:29](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/youtube/url.ts#L29)

YouTube の URL から動画 / プレイリストの ID を取り出します。
`watch?v=`・`youtu.be/`・`shorts/`・`embed/`・`live/`・`list=` に対応。

## パラメータ

### query

`string`

## 戻り値

[`YouTubeTarget`](../interfaces/YouTubeTarget.md) \| `null`
