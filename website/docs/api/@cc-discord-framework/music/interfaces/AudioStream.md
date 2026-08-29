# インターフェイス: AudioStream

定義: [plugins/music/src/StreamProvider.ts:18](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/StreamProvider.ts#L18)

[StreamProvider.stream](../classes/StreamProvider.md#stream) が返す音声ストリーム。

## プロパティ

### stream \{#stream}

```ts
readonly stream: Readable;
```

定義: [plugins/music/src/StreamProvider.ts:20](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/StreamProvider.ts#L20)

音声データ本体。

***

### type? \{#type}

```ts
readonly optional type?: StreamType;
```

定義: [plugins/music/src/StreamProvider.ts:28](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/StreamProvider.ts#L28)

ストリームの形式。既定は `Arbitrary`(ffmpeg での変換が必要)。

音源が opus を含む webm / ogg を返せる場合は `WebmOpus` / `OggOpus` を
指定してください。**変換も opus エンコードも行われず、CPU がほぼ
ゼロになり ffmpeg も不要になります。**
