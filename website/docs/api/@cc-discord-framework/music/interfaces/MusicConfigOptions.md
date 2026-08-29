# インターフェイス: MusicConfigOptions

定義: [plugins/music/src/config.ts:86](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L86)

[MusicConfig](MusicConfig.md) の部分指定。指定しなかった項目は既定値のままです。
`music()` のオプションはこれを受け取ります。

## プロパティ

### defaultVolume? \{#defaultvolume}

```ts
optional defaultVolume?: number;
```

定義: [plugins/music/src/config.ts:91](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L91)

既定の音量(1 が原音)。

#### Default

```ts
1
```

***

### leaveOnEmpty? \{#leaveonempty}

```ts
optional leaveOnEmpty?: number | false;
```

定義: [plugins/music/src/config.ts:102](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L102)

ボイスチャンネルが無人になってから切断するまでのミリ秒。
`false` で切断しない。

#### Default

```ts
30000
```

***

### leaveOnEnd? \{#leaveonend}

```ts
optional leaveOnEnd?: number | false;
```

定義: [plugins/music/src/config.ts:96](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L96)

キューが空になってから切断するまでのミリ秒。`false` で切断しない。

#### Default

```ts
30000
```

***

### limits? \{#limits}

```ts
optional limits?: Partial<MusicLimits>;
```

定義: [plugins/music/src/config.ts:117](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L117)

数量の上限。指定した項目だけが既定値を上書きします。

***

### localDirectories? \{#localdirectories}

```ts
optional localDirectories?: readonly string[];
```

定義: [plugins/music/src/config.ts:110](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L110)

ローカルファイル再生を許可するディレクトリ。
指定した場合のみローカル用の Resolver / Provider が登録されます。
ここで指定したディレクトリの外へは(シンボリックリンク経由でも)
アクセスできません。

#### Default

```ts
[] (ローカル再生は無効)
```

***

### network? \{#network}

```ts
optional network?: Partial<MusicNetworkConfig>;
```

定義: [plugins/music/src/config.ts:121](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L121)

音源の取得まわり。指定した項目だけが既定値を上書きします。

***

### texts? \{#texts}

```ts
optional texts?: Partial<MusicTexts>;
```

定義: [plugins/music/src/config.ts:115](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L115)

エンジンが投げるエラーの文言。指定した項目だけが既定値を上書きします。

#### Default

[defaultMusicTexts](../variables/defaultMusicTexts.md)

***

### voice? \{#voice}

```ts
optional voice?: Partial<MusicVoiceConfig>;
```

定義: [plugins/music/src/config.ts:119](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/config.ts#L119)

ボイス接続の挙動。指定した項目だけが既定値を上書きします。
