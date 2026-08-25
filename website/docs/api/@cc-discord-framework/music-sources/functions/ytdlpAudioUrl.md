# 関数: ytdlpAudioUrl()

```ts
function ytdlpAudioUrl(
   target, 
   config, 
   logger): Promise<{
  live: boolean;
  url: string;
  webm: boolean;
}>;
```

定義: plugins/music-sources/src/youtube/ytdlp.ts:113

再生可能な音声 URL を取り出します。

## パラメータ

### target

`string`

### config

[`YtdlpConfig`](../interfaces/YtdlpConfig.md)

### logger

`Logger`

## 戻り値

`Promise`\<\{
  `live`: `boolean`;
  `url`: `string`;
  `webm`: `boolean`;
\}\>
