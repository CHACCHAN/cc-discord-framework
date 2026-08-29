# インターフェイス: MusicConfig

定義: [plugins/music/src/config.ts:66](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L66)

## プロパティ

### defaultVolume \{#defaultvolume}

```ts
readonly defaultVolume: number;
```

定義: [plugins/music/src/config.ts:67](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L67)

***

### leaveOnEmpty \{#leaveonempty}

```ts
readonly leaveOnEmpty: number | false;
```

定義: [plugins/music/src/config.ts:69](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L69)

***

### leaveOnEnd \{#leaveonend}

```ts
readonly leaveOnEnd: number | false;
```

定義: [plugins/music/src/config.ts:68](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L68)

***

### limits \{#limits}

```ts
readonly limits: MusicLimits;
```

定義: [plugins/music/src/config.ts:75](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L75)

数量の上限。

***

### localDirectories \{#localdirectories}

```ts
readonly localDirectories: readonly string[];
```

定義: [plugins/music/src/config.ts:71](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L71)

ローカル再生を許可する絶対パス。空ならローカル再生は無効。

***

### network \{#network}

```ts
readonly network: MusicNetworkConfig;
```

定義: [plugins/music/src/config.ts:79](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L79)

音源の取得まわり。

***

### texts \{#texts}

```ts
readonly texts: MusicTexts;
```

定義: [plugins/music/src/config.ts:73](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L73)

エンジンが投げるエラーの文言。

***

### voice \{#voice}

```ts
readonly voice: MusicVoiceConfig;
```

定義: [plugins/music/src/config.ts:77](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L77)

ボイス接続の挙動。
