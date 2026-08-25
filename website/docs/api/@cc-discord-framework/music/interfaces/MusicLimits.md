# インターフェイス: MusicLimits

定義: plugins/music/src/config.ts:20

数量の上限。

## プロパティ

### historySize \{#historysize}

```ts
readonly historySize: number;
```

定義: plugins/music/src/config.ts:24

再生済みとして保持する曲数。

***

### maxConsecutiveFailures \{#maxconsecutivefailures}

```ts
readonly maxConsecutiveFailures: number;
```

定義: plugins/music/src/config.ts:26

連続で再生に失敗したとき、何曲まで飛ばして試すか。

***

### maxVolume \{#maxvolume}

```ts
readonly maxVolume: number;
```

定義: plugins/music/src/config.ts:22

音量の上限(1 が原音)。
