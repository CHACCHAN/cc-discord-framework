# インターフェイス: MusicLimits

定義: [plugins/music/src/config.ts:20](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L20)

数量の上限。

## プロパティ

### historySize \{#historysize}

```ts
readonly historySize: number;
```

定義: [plugins/music/src/config.ts:24](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L24)

再生済みとして保持する曲数。

***

### maxConsecutiveFailures \{#maxconsecutivefailures}

```ts
readonly maxConsecutiveFailures: number;
```

定義: [plugins/music/src/config.ts:26](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L26)

連続で再生に失敗したとき、何曲まで飛ばして試すか。

***

### maxVolume \{#maxvolume}

```ts
readonly maxVolume: number;
```

定義: [plugins/music/src/config.ts:22](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L22)

音量の上限(1 が原音)。
