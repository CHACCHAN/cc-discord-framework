# インターフェイス: MusicTexts

定義: plugins/music/src/texts.ts:16

**エンジンが投げるエラーの文言**のカタログ。

このプラグインはコマンドを持たないため、ここにあるのは
「再生エンジンが失敗したときにエラーへ載せる文言」だけです。
コマンドの応答文言や見せ方は Bot 側(`client/`)が自分のコードで決めます。

ここにある文言は **すべて差し替えられます**。ハードコードされていて
変えられない文言は存在しません。

```ts
music({ texts: { nothingPlaying: "いま何も鳴っていません。" } })
```

## プロパティ

### accessDenied \{#accessdenied}

```ts
accessDenied: string;
```

定義: plugins/music/src/texts.ts:27

許可ディレクトリ外のローカルファイルを要求された。

***

### httpFailed \{#httpfailed}

```ts
httpFailed: (status, title) => string;
```

定義: plugins/music/src/texts.ts:29

音源の取得が HTTP エラーで失敗した。

#### パラメータ

##### status

`number`

##### title

`string`

#### 戻り値

`string`

***

### httpTimedOut \{#httptimedout}

```ts
httpTimedOut: (title) => string;
```

定義: plugins/music/src/texts.ts:33

HTTP 音源が制限時間内に応答しなかった。

#### パラメータ

##### title

`string`

#### 戻り値

`string`

***

### noProvider \{#noprovider}

```ts
noProvider: (title) => string;
```

定義: plugins/music/src/texts.ts:20

トラックを再生できる StreamProvider がなかった(引数はトラックのタイトル)。

#### パラメータ

##### title

`string`

#### 戻り値

`string`

***

### noResult \{#noresult}

```ts
noResult: (query) => string;
```

定義: plugins/music/src/texts.ts:18

クエリに一致する音源が見つからなかった。

#### パラメータ

##### query

`string`

#### 戻り値

`string`

***

### notAudio \{#notaudio}

```ts
notAudio: (contentType) => string;
```

定義: plugins/music/src/texts.ts:39

取得した内容が音声ではなかった。

#### パラメータ

##### contentType

`string`

#### 戻り値

`string`

***

### nothingPlaying \{#nothingplaying}

```ts
nothingPlaying: string;
```

定義: plugins/music/src/texts.ts:25

何も再生していない状態で再生操作が行われた。
[NotPlayingError](../classes/NotPlayingError.md) を投げるときの既定文言として使えます。

***

### privateAddressDenied \{#privateaddressdenied}

```ts
privateAddressDenied: (host) => string;
```

定義: plugins/music/src/texts.ts:31

HTTP 音源の接続先が安全な公開アドレスではなかった。

#### パラメータ

##### host

`string`

#### 戻り値

`string`

***

### streamFailed \{#streamfailed}

```ts
streamFailed: (title) => string;
```

定義: plugins/music/src/texts.ts:41

応答本文が空でストリームを開けなかった。

#### パラメータ

##### title

`string`

#### 戻り値

`string`

***

### tooManyRedirects \{#toomanyredirects}

```ts
tooManyRedirects: (title) => string;
```

定義: plugins/music/src/texts.ts:35

HTTP 音源のリダイレクト回数が設定上限を超えた。

#### パラメータ

##### title

`string`

#### 戻り値

`string`

***

### voiceChannelMismatch \{#voicechannelmismatch}

```ts
voiceChannelMismatch: string;
```

定義: plugins/music/src/texts.ts:37

既存の音楽キューとは異なるボイスチャンネルから再生を要求した。
