# インターフェイス: PlayResult

定義: plugins/music/src/AudioService.ts:26

[AudioService.play](../classes/AudioService.md#play) の戻り値。

## プロパティ

### queue \{#queue}

```ts
readonly queue: GuildQueue;
```

定義: plugins/music/src/AudioService.ts:28

対象ギルドのキュー。

***

### started \{#started}

```ts
readonly started: boolean;
```

定義: plugins/music/src/AudioService.ts:38

追加によって **実際に再生が始まったか**。

`false` になるのは「既存の再生に追加された」場合と、
「再生を試みたが音源を開けなかった」場合です(後者は
`musicError` で通知されます)。

***

### tracks \{#tracks}

```ts
readonly tracks: Track[];
```

定義: plugins/music/src/AudioService.ts:30

追加されたトラック(プレイリストなら複数)。
