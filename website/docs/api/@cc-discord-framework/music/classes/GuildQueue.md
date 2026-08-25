# クラス: GuildQueue

定義: plugins/music/src/GuildQueue.ts:52

1ギルド分の音楽セッション。ボイス接続・プレイヤー・キューをまとめて
保持します。`this.services.audio.queue(guildId)` で取得できます。

## プロパティ

### guildId \{#guildid}

```ts
readonly guildId: string;
```

定義: plugins/music/src/GuildQueue.ts:54

対象ギルドの ID。

***

### loop \{#loop}

```ts
loop: LoopMode = "off";
```

定義: plugins/music/src/GuildQueue.ts:64

ループの挙動。

***

### textChannel \{#textchannel}

```ts
textChannel: TextBasedChannel | null = null;
```

定義: plugins/music/src/GuildQueue.ts:61

通知先として記録しておくテキストチャンネル(任意)。
プラグインはここへ送信しません。`musicError` などのリスナーで
Bot 側が使うための控えです。

## アクセッサー

### current \{#current}

#### 署名を取得する

```ts
get current(): Track | null;
```

定義: plugins/music/src/GuildQueue.ts:143

再生中のトラック。

##### 戻り値

[`Track`](../interfaces/Track.md) \| `null`

***

### destroyed \{#destroyed}

#### 署名を取得する

```ts
get destroyed(): boolean;
```

定義: plugins/music/src/GuildQueue.ts:176

破棄済みか。

##### 戻り値

`boolean`

***

### history \{#history}

#### 署名を取得する

```ts
get history(): readonly Track[];
```

定義: plugins/music/src/GuildQueue.ts:148

再生済みのトラック(新しい順・最大 `limits.historySize` 件)。

##### 戻り値

readonly [`Track`](../interfaces/Track.md)[]

***

### paused \{#paused}

#### 署名を取得する

```ts
get paused(): boolean;
```

定義: plugins/music/src/GuildQueue.ts:158

一時停止中か。

##### 戻り値

`boolean`

***

### playbackDuration \{#playbackduration}

#### 署名を取得する

```ts
get playbackDuration(): number;
```

定義: plugins/music/src/GuildQueue.ts:171

現在トラックの再生位置(ミリ秒)。

##### 戻り値

`number`

***

### playing \{#playing}

#### 署名を取得する

```ts
get playing(): boolean;
```

定義: plugins/music/src/GuildQueue.ts:153

何かを再生中か(一時停止中も含む)。

##### 戻り値

`boolean`

***

### tracks \{#tracks}

#### 署名を取得する

```ts
get tracks(): readonly Track[];
```

定義: plugins/music/src/GuildQueue.ts:138

再生待ちのトラック(読み取り専用)。

##### 戻り値

readonly [`Track`](../interfaces/Track.md)[]

***

### voiceChannelId \{#voicechannelid}

#### 署名を取得する

```ts
get voiceChannelId(): string | null;
```

定義: plugins/music/src/GuildQueue.ts:166

接続中のボイスチャンネル ID。

##### 戻り値

`string` \| `null`

***

### volume \{#volume}

#### 署名を取得する

```ts
get volume(): number;
```

定義: plugins/music/src/GuildQueue.ts:181

音量(0〜`limits.maxVolume`、1 が原音)。

##### 戻り値

`number`

#### 署名を設定する

```ts
set volume(value): void;
```

定義: plugins/music/src/GuildQueue.ts:185

##### パラメータ

###### value

`number`

##### 戻り値

`void`

## メソッド

### add() \{#add}

```ts
add(...tracks): void;
```

定義: plugins/music/src/GuildQueue.ts:198

キュー末尾へ追加します。

#### パラメータ

##### tracks

...[`Track`](../interfaces/Track.md)[]

#### 戻り値

`void`

***

### clear() \{#clear}

```ts
clear(): void;
```

定義: plugins/music/src/GuildQueue.ts:224

待機列を空にします(再生中の曲は止めません)。

#### 戻り値

`void`

***

### connect() \{#connect}

```ts
connect(channel): Promise<void>;
```

定義: plugins/music/src/GuildQueue.ts:293

ボイスチャンネルへ接続します。Ready の同一接続だけを再利用します。
同じ試行中に別チャンネルから呼ばれた場合は、後発側を拒否します。

#### パラメータ

##### channel

`VoiceBasedChannel`

#### 戻り値

`Promise`\<`void`\>

***

### destroy() \{#destroy}

```ts
destroy(): void;
```

定義: plugins/music/src/GuildQueue.ts:344

切断してこのキューを破棄します。

#### 戻り値

`void`

***

### insert() \{#insert}

```ts
insert(index, ...tracks): void;
```

定義: plugins/music/src/GuildQueue.ts:204

指定位置へ挿入します(0 が次に再生される位置)。

#### パラメータ

##### index

`number`

##### tracks

...[`Track`](../interfaces/Track.md)[]

#### 戻り値

`void`

***

### move() \{#move}

```ts
move(from, to): boolean;
```

定義: plugins/music/src/GuildQueue.ts:216

キュー内でトラックを移動します。

#### パラメータ

##### from

`number`

##### to

`number`

#### 戻り値

`boolean`

***

### pause() \{#pause}

```ts
pause(): boolean;
```

定義: plugins/music/src/GuildQueue.ts:271

一時停止します。

#### 戻り値

`boolean`

***

### remove() \{#remove}

```ts
remove(index): Track | null;
```

定義: plugins/music/src/GuildQueue.ts:210

指定位置のトラックを取り除いて返します。

#### パラメータ

##### index

`number`

#### 戻り値

[`Track`](../interfaces/Track.md) \| `null`

***

### resume() \{#resume}

```ts
resume(): boolean;
```

定義: plugins/music/src/GuildQueue.ts:276

再開します。

#### 戻り値

`boolean`

***

### shuffle() \{#shuffle}

```ts
shuffle(): void;
```

定義: plugins/music/src/GuildQueue.ts:233

待機列をシャッフルします。

#### 戻り値

`void`

***

### skip() \{#skip}

```ts
skip(count?): number;
```

定義: plugins/music/src/GuildQueue.ts:256

現在のトラックをスキップします。`count` 曲まとめてスキップできます。
`loop: "track"` は無視されます(同じ曲が繰り返されない)。

#### パラメータ

##### count?

`number` = `1`

#### 戻り値

`number`

実際にスキップした数(再生中の1曲 + キューから外した数)。
  キューに残っている以上の `count` を渡しても、あるだけしか
  飛ばせません — 表示にはこの戻り値を使ってください。

***

### start() \{#start}

```ts
start(): Promise<void>;
```

定義: plugins/music/src/GuildQueue.ts:243

再生を開始します。すでに再生中、またはキューが空なら何もしません。

#### 戻り値

`Promise`\<`void`\>

***

### stop() \{#stop}

```ts
stop(): void;
```

定義: plugins/music/src/GuildQueue.ts:281

再生を止め、キューを空にして切断します。

#### 戻り値

`void`
