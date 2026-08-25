# インターフェイス: MusicSourcesOptions

定義: plugins/music-sources/src/index.ts:51

部分指定。指定しなかった項目は既定値のままになります。

## プロパティ

### ffmpeg? \{#ffmpeg}

```ts
optional ffmpeg?: Partial<FfmpegConfig>;
```

定義: plugins/music-sources/src/index.ts:62

変換が必要な音源で使う ffmpeg。

***

### search? \{#search}

```ts
optional search?: SearchProvider;
```

定義: plugins/music-sources/src/index.ts:60

URL でない入力(素の検索語)を誰が拾うか。

#### Default

```ts
"youtube"
```

***

### soundcloud? \{#soundcloud}

```ts
optional soundcloud?: boolean | Partial<SoundCloudConfig>;
```

定義: plugins/music-sources/src/index.ts:55

SoundCloud。`false` で無効化。

***

### youtube? \{#youtube}

```ts
optional youtube?: 
  | boolean
  | Partial<Omit<YouTubeConfig, "ytdlp">> & object;
```

定義: plugins/music-sources/src/index.ts:53

YouTube。`false` で無効化。
