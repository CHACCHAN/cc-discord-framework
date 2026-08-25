# 変数: MusicEvents

```ts
const MusicEvents: object;
```

定義: plugins/music/src/events.ts:18

music プラグインがクライアント上で発火するイベント。
通常の discord.js エミッターに乗るため、`Listener` コンポーネントで
型付きのまま観測できます。

```ts
@Listener.define({ event: "musicTrackStart" })
export class NowPlayingListener extends Listener<"musicTrackStart"> {
  override async run(queue: GuildQueue, track: Track) {
    await queue.textChannel?.send(`▶ ${track.title}`);
  }
}
```

## 型宣言

### Disconnect \{#disconnect}

```ts
readonly Disconnect: "musicDisconnect" = "musicDisconnect";
```

ボイス接続の切断: `(queue)`

### Error \{#error}

```ts
readonly Error: "musicError" = "musicError";
```

再生中のエラー: `(error, queue, track)`

### QueueEnd \{#queueend}

```ts
readonly QueueEnd: "musicQueueEnd" = "musicQueueEnd";
```

キューが空になった: `(queue)`

### TrackEnd \{#trackend}

```ts
readonly TrackEnd: "musicTrackEnd" = "musicTrackEnd";
```

再生終了(スキップ含む): `(queue, track)`

### TrackStart \{#trackstart}

```ts
readonly TrackStart: "musicTrackStart" = "musicTrackStart";
```

再生開始: `(queue, track)`
