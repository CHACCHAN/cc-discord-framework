# 関数: ytdlpJson()

```ts
function ytdlpJson(
   args, 
   config, 
logger): Promise<YtdlpInfo>;
```

定義: plugins/music-sources/src/youtube/ytdlp.ts:58

yt-dlp を実行して JSON を受け取ります。

## パラメータ

### args

readonly `string`[]

### config

[`YtdlpConfig`](../interfaces/YtdlpConfig.md)

### logger

`Logger`

## 戻り値

`Promise`\<[`YtdlpInfo`](../interfaces/YtdlpInfo.md)\>
