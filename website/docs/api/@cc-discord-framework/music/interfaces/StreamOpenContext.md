# インターフェイス: StreamOpenContext

定義: [plugins/music/src/StreamProvider.ts:32](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/StreamProvider.ts#L32)

StreamProvider が音源を開く際の呼び出しコンテキスト。

## プロパティ

### signal? \{#signal}

```ts
readonly optional signal?: AbortSignal;
```

定義: [plugins/music/src/StreamProvider.ts:34](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/StreamProvider.ts#L34)

キュー操作などで、この読み込みが不要になったことを知らせるシグナル。
