# 型エイリアス: ListenerEvent

```ts
type ListenerEvent = keyof ClientEvents;
```

定義: src/listener/Listener.ts:9

リスナーが観測できるイベント: すべての discord.js クライアントイベントに
加えて、フレームワーク自身のイベント(同じエミッターを共有します)。
