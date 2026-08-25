# 関数: ytdlpJson()

```ts
function ytdlpJson(
   args, 
   config, 
logger): Promise<YtdlpInfo>;
```

定義: [plugins/music-sources/src/youtube/ytdlp.ts:58](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/youtube/ytdlp.ts#L58)

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
