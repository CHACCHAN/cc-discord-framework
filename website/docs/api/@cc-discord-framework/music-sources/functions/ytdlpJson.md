# 関数: ytdlpJson()

```ts
function ytdlpJson(
   args, 
   config, 
logger): Promise<YtdlpInfo>;
```

定義: [plugins/music-sources/src/youtube/ytdlp.ts:58](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/youtube/ytdlp.ts#L58)

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
