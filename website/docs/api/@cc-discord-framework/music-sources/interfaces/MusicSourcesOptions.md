# インターフェイス: MusicSourcesOptions

定義: [plugins/music-sources/src/index.ts:51](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/index.ts#L51)

部分指定。指定しなかった項目は既定値のままになります。

## プロパティ

### ffmpeg? \{#ffmpeg}

```ts
optional ffmpeg?: Partial<FfmpegConfig>;
```

定義: [plugins/music-sources/src/index.ts:62](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/index.ts#L62)

変換が必要な音源で使う ffmpeg。

***

### search? \{#search}

```ts
optional search?: SearchProvider;
```

定義: [plugins/music-sources/src/index.ts:60](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/index.ts#L60)

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

定義: [plugins/music-sources/src/index.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/index.ts#L55)

SoundCloud。`false` で無効化。

***

### youtube? \{#youtube}

```ts
optional youtube?: 
  | boolean
  | Partial<Omit<YouTubeConfig, "ytdlp">> & object;
```

定義: [plugins/music-sources/src/index.ts:53](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/index.ts#L53)

YouTube。`false` で無効化。
