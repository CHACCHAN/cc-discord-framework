# インターフェイス: PlayOptions

定義: plugins/music/src/AudioService.ts:9

[AudioService.play](../classes/AudioService.md#play) の引数。

## プロパティ

### channel \{#channel}

```ts
readonly channel: VoiceBasedChannel;
```

定義: plugins/music/src/AudioService.ts:11

接続先のボイスチャンネル。

***

### next? \{#next}

```ts
readonly optional next?: boolean;
```

定義: plugins/music/src/AudioService.ts:22

キュー先頭へ割り込む。

***

### query \{#query}

```ts
readonly query: string;
```

定義: plugins/music/src/AudioService.ts:13

URL または検索クエリ。

***

### requestedBy? \{#requestedby}

```ts
readonly optional requestedBy?: string;
```

定義: plugins/music/src/AudioService.ts:15

リクエストしたユーザーの ID。

***

### textChannel? \{#textchannel}

```ts
readonly optional textChannel?: TextBasedChannel;
```

定義: plugins/music/src/AudioService.ts:20

通知先として `queue.textChannel` に記録するテキストチャンネル。
プラグインはここへ送信しません(表示は Bot 側のリスナーの担当)。
