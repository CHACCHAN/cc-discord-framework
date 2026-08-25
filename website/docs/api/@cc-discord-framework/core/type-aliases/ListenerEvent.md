# 型エイリアス: ListenerEvent

```ts
type ListenerEvent = keyof ClientEvents;
```

定義: [src/listener/Listener.ts:9](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/listener/Listener.ts#L9)

リスナーが観測できるイベント: すべての discord.js クライアントイベントに
加えて、フレームワーク自身のイベント(同じエミッターを共有します)。
