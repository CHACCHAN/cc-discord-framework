# 型エイリアス: ListenerEvent

```ts
type ListenerEvent = keyof ClientEvents;
```

定義: [src/listener/Listener.ts:9](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/listener/Listener.ts#L9)

リスナーが観測できるイベント: すべての discord.js クライアントイベントに
加えて、フレームワーク自身のイベント(同じエミッターを共有します)。
