# インターフェイス: PlayResult

定義: [plugins/music/src/AudioService.ts:26](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/AudioService.ts#L26)

[AudioService.play](../classes/AudioService.md#play) の戻り値。

## プロパティ

### queue \{#queue}

```ts
readonly queue: GuildQueue;
```

定義: [plugins/music/src/AudioService.ts:28](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/AudioService.ts#L28)

対象ギルドのキュー。

***

### started \{#started}

```ts
readonly started: boolean;
```

定義: [plugins/music/src/AudioService.ts:38](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/AudioService.ts#L38)

追加によって **実際に再生が始まったか**。

`false` になるのは「既存の再生に追加された」場合と、
「再生を試みたが音源を開けなかった」場合です(後者は
`musicError` で通知されます)。

***

### tracks \{#tracks}

```ts
readonly tracks: Track[];
```

定義: [plugins/music/src/AudioService.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/AudioService.ts#L30)

追加されたトラック(プレイリストなら複数)。
