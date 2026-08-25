# インターフェイス: StreamOpenContext

定義: [plugins/music/src/StreamProvider.ts:32](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/StreamProvider.ts#L32)

StreamProvider が音源を開く際の呼び出しコンテキスト。

## プロパティ

### signal? \{#signal}

```ts
readonly optional signal?: AbortSignal;
```

定義: [plugins/music/src/StreamProvider.ts:34](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/StreamProvider.ts#L34)

キュー操作などで、この読み込みが不要になったことを知らせるシグナル。
