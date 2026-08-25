# インターフェイス: SoundCloudConfig

定義: [plugins/music-sources/src/config.ts:74](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/config.ts#L74)

## プロパティ

### artworkSize \{#artworksize}

```ts
artworkSize: string | null;
```

定義: [plugins/music-sources/src/config.ts:94](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/config.ts#L94)

サムネイルのサイズ。SoundCloud の既定は小さい `-large` なので、
ここで指定したサイズへ差し替えます。`null` で差し替えない。

#### Default

```ts
"t500x500"
```

***

### clientId \{#clientid}

```ts
clientId: string | null;
```

定義: [plugins/music-sources/src/config.ts:86](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/config.ts#L86)

client_id。未指定なら soundcloud.ts が公開バンドルから自動抽出します
(数か月で失効することがあるため、安定させたい場合は指定してください)。

***

### enabled \{#enabled}

```ts
enabled: boolean;
```

定義: [plugins/music-sources/src/config.ts:75](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/config.ts#L75)

***

### oauthToken \{#oauthtoken}

```ts
oauthToken: string | null;
```

定義: [plugins/music-sources/src/config.ts:88](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/config.ts#L88)

Go+ 音質などに必要な OAuth トークン。

***

### playlistLimit \{#playlistlimit}

```ts
playlistLimit: number;
```

定義: [plugins/music-sources/src/config.ts:81](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/config.ts#L81)

プレイリストから取り込む最大曲数。

#### Default

```ts
100
```

***

### priority \{#priority}

```ts
priority: number;
```

定義: [plugins/music-sources/src/config.ts:77](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/config.ts#L77)

Resolver の優先度。

#### Default

```ts
20
```

***

### searchLimit \{#searchlimit}

```ts
searchLimit: number;
```

定義: [plugins/music-sources/src/config.ts:79](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/config.ts#L79)

検索で候補を何件取得するか。

#### Default

```ts
5
```
