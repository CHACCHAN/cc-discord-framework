# 関数: parseYouTubeUrl()

```ts
function parseYouTubeUrl(query): YouTubeTarget | null;
```

定義: plugins/music-sources/src/youtube/url.ts:29

YouTube の URL から動画 / プレイリストの ID を取り出します。
`watch?v=`・`youtu.be/`・`shorts/`・`embed/`・`live/`・`list=` に対応。

## パラメータ

### query

`string`

## 戻り値

[`YouTubeTarget`](../interfaces/YouTubeTarget.md) \| `null`
