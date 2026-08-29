# インターフェイス: AiStreamConfig

定義: [plugins/ai/src/config.ts:52](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L52)

Discord へのストリーミング表示。

既定値は Discord の制限に合わせています — インタラクション応答の編集は
おおよそ **5秒あたり5回** までなので、1.2秒間隔なら安全圏です。

## プロパティ

### cursor \{#cursor}

```ts
readonly cursor: string;
```

定義: [plugins/ai/src/config.ts:58](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L58)

生成中に本文の末尾へ添える記号。空文字にすると何も添えません。

***

### enabled \{#enabled}

```ts
readonly enabled: boolean;
```

定義: [plugins/ai/src/config.ts:54](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L54)

生成中の途中経過を編集で見せる。`false` なら完成してから1回だけ送ります。

***

### intervalMs \{#intervalms}

```ts
readonly intervalMs: number;
```

定義: [plugins/ai/src/config.ts:56](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L56)

編集の最短間隔(ミリ秒)。
