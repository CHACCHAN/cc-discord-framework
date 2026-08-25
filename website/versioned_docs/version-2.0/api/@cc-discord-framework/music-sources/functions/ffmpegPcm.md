# 関数: ffmpegPcm()

```ts
function ffmpegPcm(
   input, 
   config, 
   logger): Readable;
```

定義: [plugins/music-sources/src/ffmpeg.ts:28](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/ffmpeg.ts#L28)

入力 URL を ffmpeg に食わせ、標準出力の PCM を Node のストリームとして
返します。ストリームが閉じられたらプロセスも確実に終了させます。

## パラメータ

### input

`string`

### config

[`FfmpegConfig`](../interfaces/FfmpegConfig.md)

### logger

`Logger`

## 戻り値

`Readable`
