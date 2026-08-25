# インターフェイス: StreamOpenContext

定義: plugins/music/src/StreamProvider.ts:32

StreamProvider が音源を開く際の呼び出しコンテキスト。

## プロパティ

### signal? \{#signal}

```ts
readonly optional signal?: AbortSignal;
```

定義: plugins/music/src/StreamProvider.ts:34

キュー操作などで、この読み込みが不要になったことを知らせるシグナル。
