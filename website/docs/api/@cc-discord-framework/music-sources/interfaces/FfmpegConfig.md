# インターフェイス: FfmpegConfig

定義: plugins/music-sources/src/config.ts:34

## プロパティ

### args \{#args}

```ts
args: (input) => string[];
```

定義: plugins/music-sources/src/config.ts:41

入力 URL から引数列を組み立てます。丸ごと差し替えられます。
標準出力へ 48kHz ステレオの s16le PCM を吐くこと。

#### パラメータ

##### input

`string`

#### 戻り値

`string`[]

***

### path \{#path}

```ts
path: string;
```

定義: plugins/music-sources/src/config.ts:36

実行ファイル。

#### Default

```ts
"ffmpeg"
```
