# インターフェイス: FfmpegConfig

定義: [plugins/music-sources/src/config.ts:34](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/config.ts#L34)

## プロパティ

### args \{#args}

```ts
args: (input) => string[];
```

定義: [plugins/music-sources/src/config.ts:41](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/config.ts#L41)

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

定義: [plugins/music-sources/src/config.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music-sources/src/config.ts#L36)

実行ファイル。

#### Default

```ts
"ffmpeg"
```
