# インターフェイス: YouTubeConfig

定義: [plugins/music-sources/src/config.ts:44](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/config.ts#L44)

## プロパティ

### cookies \{#cookies}

```ts
cookies: string | null;
```

定義: [plugins/music-sources/src/config.ts:67](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/config.ts#L67)

yt-dlp に渡す cookies ファイル。年齢制限付き動画などに。

***

### enabled \{#enabled}

```ts
enabled: boolean;
```

定義: [plugins/music-sources/src/config.ts:45](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/config.ts#L45)

***

### metadata \{#metadata}

```ts
metadata: MetadataSource;
```

定義: [plugins/music-sources/src/config.ts:54](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/config.ts#L54)

メタデータの取得元。`"innertube"` は youtubei.js を使い高速ですが、
YouTube 側の変更で壊れることがあります。その場合は自動的に yt-dlp へ
切り替わります(`"yt-dlp"` を指定すると最初から yt-dlp を使います)。

#### Default

```ts
"innertube"
```

***

### playlistLimit \{#playlistlimit}

```ts
playlistLimit: number;
```

定義: [plugins/music-sources/src/config.ts:65](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/config.ts#L65)

プレイリストから取り込む最大曲数。

#### Default

```ts
100
```

***

### priority \{#priority}

```ts
priority: number;
```

定義: [plugins/music-sources/src/config.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/config.ts#L47)

Resolver の優先度。大きいほど先に試されます。

#### Default

```ts
20
```

***

### searchLimit \{#searchlimit}

```ts
searchLimit: number;
```

定義: [plugins/music-sources/src/config.ts:63](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/config.ts#L63)

検索で取得する候補数(採用するのは先頭1件)。少ないほど速くなります。

**yt-dlp 経路(`metadata: "yt-dlp"` とフォールバック時)でのみ効きます。**
InnerTube の検索 API は件数を指定できないため、`metadata: "innertube"`
のときは YouTube が返す件数のままです。

#### Default

```ts
5
```

***

### userAgent \{#useragent}

```ts
userAgent: string;
```

定義: [plugins/music-sources/src/config.ts:69](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/config.ts#L69)

音源の取得時に送る User-Agent。

#### Default

```ts
"cc-discord-framework-music-sources"
```

***

### ytdlp \{#ytdlp}

```ts
ytdlp: YtdlpConfig;
```

定義: [plugins/music-sources/src/config.ts:71](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/config.ts#L71)

再生 URL の取得に使う yt-dlp の設定。
