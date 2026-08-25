# インターフェイス: MusicConfig

定義: plugins/music/src/config.ts:66

## プロパティ

### defaultVolume \{#defaultvolume}

```ts
readonly defaultVolume: number;
```

定義: plugins/music/src/config.ts:67

***

### leaveOnEmpty \{#leaveonempty}

```ts
readonly leaveOnEmpty: number | false;
```

定義: plugins/music/src/config.ts:69

***

### leaveOnEnd \{#leaveonend}

```ts
readonly leaveOnEnd: number | false;
```

定義: plugins/music/src/config.ts:68

***

### limits \{#limits}

```ts
readonly limits: MusicLimits;
```

定義: plugins/music/src/config.ts:75

数量の上限。

***

### localDirectories \{#localdirectories}

```ts
readonly localDirectories: readonly string[];
```

定義: plugins/music/src/config.ts:71

ローカル再生を許可する絶対パス。空ならローカル再生は無効。

***

### network \{#network}

```ts
readonly network: MusicNetworkConfig;
```

定義: plugins/music/src/config.ts:79

音源の取得まわり。

***

### texts \{#texts}

```ts
readonly texts: MusicTexts;
```

定義: plugins/music/src/config.ts:73

エンジンが投げるエラーの文言。

***

### voice \{#voice}

```ts
readonly voice: MusicVoiceConfig;
```

定義: plugins/music/src/config.ts:77

ボイス接続の挙動。
