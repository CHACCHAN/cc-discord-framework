# インターフェイス: Track

定義: [plugins/music/src/track.ts:2](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/track.ts#L2)

再生対象の1曲。Resolver が生成し、StreamProvider が音声へ変換します。

## プロパティ

### author \{#author}

```ts
readonly author: string | null;
```

定義: [plugins/music/src/track.ts:10](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/track.ts#L10)

アーティスト・投稿者。

***

### data \{#data}

```ts
readonly data: unknown;
```

定義: [plugins/music/src/track.ts:26](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/track.ts#L26)

Provider が再生時に使う任意のデータ。

***

### duration \{#duration}

```ts
readonly duration: number | null;
```

定義: [plugins/music/src/track.ts:8](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/track.ts#L8)

長さ(ミリ秒)。ラジオなど不定の場合は `null`。

***

### isrc \{#isrc}

```ts
readonly isrc: string | null;
```

定義: [plugins/music/src/track.ts:18](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/track.ts#L18)

ISRC(国際標準レコーディングコード)。
Spotify のようなメタデータ専用ソースから、実際に再生できるソースへ
ブリッジする際の照合キーになります。

***

### live \{#live}

```ts
readonly live: boolean;
```

定義: [plugins/music/src/track.ts:20](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/track.ts#L20)

ライブ配信・ラジオなど終端のないストリームか。

***

### requestedBy \{#requestedby}

```ts
readonly requestedBy: string | null;
```

定義: [plugins/music/src/track.ts:24](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/track.ts#L24)

リクエストしたユーザーの ID。

***

### source \{#source}

```ts
readonly source: string;
```

定義: [plugins/music/src/track.ts:22](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/track.ts#L22)

解決した Resolver の名前。

***

### thumbnail \{#thumbnail}

```ts
readonly thumbnail: string | null;
```

定義: [plugins/music/src/track.ts:12](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/track.ts#L12)

サムネイル URL。

***

### title \{#title}

```ts
readonly title: string;
```

定義: [plugins/music/src/track.ts:4](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/track.ts#L4)

表示名。

***

### url \{#url}

```ts
readonly url: string;
```

定義: [plugins/music/src/track.ts:6](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/track.ts#L6)

元の URL(表示・再解決に使う)。ローカルファイルの場合はパス。
