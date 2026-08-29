# インターフェイス: MusicVoiceConfig

定義: [plugins/music/src/config.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L30)

ボイス接続の挙動。

## プロパティ

### noSubscriberBehavior \{#nosubscriberbehavior}

```ts
readonly noSubscriberBehavior: NoSubscriberBehavior;
```

定義: [plugins/music/src/config.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L42)

購読者(ボイス接続)がいないときの挙動。既定は `Pause` —
一時的に切断されても曲を消費してしまわないようにするためです。
ボイス接続を張らずに再生を進めたいテストでは `Play` にします。

***

### readyTimeout \{#readytimeout}

```ts
readonly readyTimeout: number;
```

定義: [plugins/music/src/config.ts:34](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L34)

接続完了を待つミリ秒。

***

### reconnectTimeout \{#reconnecttimeout}

```ts
readonly reconnectTimeout: number;
```

定義: [plugins/music/src/config.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L36)

一時的な切断からの復帰を待つミリ秒。

***

### selfDeaf \{#selfdeaf}

```ts
readonly selfDeaf: boolean;
```

定義: [plugins/music/src/config.ts:32](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L32)

接続時に自分のマイクを塞ぐ(受信専用にする)。
