# インターフェイス: YtdlpConfig

定義: plugins/music-sources/src/config.ts:14

## プロパティ

### commonArgs \{#commonargs}

```ts
commonArgs: readonly string[];
```

定義: plugins/music-sources/src/config.ts:24

毎回付ける引数。

#### Default

```ts
["--no-warnings", "--no-progress"]
```

***

### format \{#format}

```ts
format: string;
```

定義: plugins/music-sources/src/config.ts:22

`-f` に渡すフォーマット指定。既定は opus を最優先にしており、
取得できれば **変換なし**(ffmpeg 不要)で再生できます。

#### Default

```ts
"bestaudio[acodec=opus]/bestaudio"
```

***

### path \{#path}

```ts
path: string;
```

定義: plugins/music-sources/src/config.ts:16

実行ファイル。PATH 上にあれば名前だけで構いません。

#### Default

```ts
"yt-dlp"
```

***

### timeout \{#timeout}

```ts
timeout: number | false;
```

定義: plugins/music-sources/src/config.ts:31

yt-dlp の完了をこのミリ秒まで待ちます。超えるとプロセスを kill して
エラーにします(ハングした yt-dlp がギルドのキューを塞ぎ続けない
ための保険)。`false` で打ち切らずに待ち続けます。

#### Default

```ts
30000
```
