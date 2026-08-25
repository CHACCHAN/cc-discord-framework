# 関数: ffmpegPcm()

```ts
function ffmpegPcm(
   input, 
   config, 
   logger): Readable;
```

定義: plugins/music-sources/src/ffmpeg.ts:28

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
