# クラス: YouTubeStreamProvider

定義: [plugins/music-sources/src/youtube/YouTubeStreamProvider.ts:15](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/youtube/YouTubeStreamProvider.ts#L15)

[Track](../../music/interfaces/Track.md) を実際の音声ストリームへ変換するコンポーネント。
`providers/` ディレクトリに置くと自動ロードされます。

Resolver(何を再生するか)と Provider(どこから音を取るか)を分けている
ため、片方が壊れてももう片方は生き残ります。例えば YouTube の抽出が
壊れたときは Provider を差し替えるだけで、Spotify の解決処理はそのまま
使えます。

```ts
@StreamProvider.define({ priority: 10 })
export class MyProvider extends StreamProvider {
  canStream(track: Track) { return track.source === "my-resolver"; }
  async stream(track: Track): Promise<AudioStream> {
    return { stream: await openStream(track.url), type: StreamType.WebmOpus };
  }
}
```

## 拡張

- [`StreamProvider`](../../music/classes/StreamProvider.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new YouTubeStreamProvider(): YouTubeStreamProvider;
```

#### 戻り値

`YouTubeStreamProvider`

#### 継承元

[`StreamProvider`](../../music/classes/StreamProvider.md).[`constructor`](../../music/classes/StreamProvider.md#constructor)

## プロパティ

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/Component.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L30)

フレームワーク共有サービスを持つコンテナ。

#### 継承元

[`StreamProvider`](../../music/classes/StreamProvider.md).[`container`](../../music/classes/StreamProvider.md#container)

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: [src/component/Component.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L39)

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

#### 継承元

[`StreamProvider`](../../music/classes/StreamProvider.md).[`location`](../../music/classes/StreamProvider.md#location)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/Component.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L36)

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

#### 継承元

[`StreamProvider`](../../music/classes/StreamProvider.md).[`logger`](../../music/classes/StreamProvider.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/Component.ts:27](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L27)

ストア内で一意なコンポーネント名。

#### 継承元

[`StreamProvider`](../../music/classes/StreamProvider.md).[`name`](../../music/classes/StreamProvider.md#name)

***

### priority \{#priority}

```ts
readonly priority: number;
```

定義: [plugins/music/src/StreamProvider.ts:57](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/StreamProvider.ts#L57)

#### 継承元

[`StreamProvider`](../../music/classes/StreamProvider.md).[`priority`](../../music/classes/StreamProvider.md#priority)

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: [src/component/Component.ts:33](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L33)

このコンポーネントが属するストア。

#### 継承元

[`StreamProvider`](../../music/classes/StreamProvider.md).[`store`](../../music/classes/StreamProvider.md#store)

## アクセッサー

### client \{#client}

#### 署名を取得する

```ts
get client(): Client;
```

定義: [src/component/Component.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L42)

フレームワーククライアント。

##### 戻り値

[`Client`](../../core/classes/Client.md)

#### 継承元

[`StreamProvider`](../../music/classes/StreamProvider.md).[`client`](../../music/classes/StreamProvider.md#client)

***

### services \{#services}

#### 署名を取得する

```ts
get services(): Services;
```

定義: [src/component/Component.ts:50](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L50)

ロード済みサービスへのアクセス(`services/` から自動収束)。
import せずに `this.services.<名前>` で参照できます。

##### 戻り値

[`Services`](../../core/interfaces/Services.md)

#### 継承元

[`StreamProvider`](../../music/classes/StreamProvider.md).[`services`](../../music/classes/StreamProvider.md#services)

## メソッド

### canStream() \{#canstream}

```ts
canStream(track): boolean;
```

定義: [plugins/music-sources/src/youtube/YouTubeStreamProvider.ts:21](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/youtube/YouTubeStreamProvider.ts#L21)

このトラックを再生できるか。副作用のない高速な判定にしてください。

#### パラメータ

##### track

[`Track`](../../music/interfaces/Track.md)

#### 戻り値

`boolean`

#### 上書き

[`StreamProvider`](../../music/classes/StreamProvider.md).[`canStream`](../../music/classes/StreamProvider.md#canstream)

***

### onLoad() \{#onload}

```ts
onLoad(): void;
```

定義: [plugins/music-sources/src/youtube/YouTubeStreamProvider.ts:17](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/youtube/YouTubeStreamProvider.ts#L17)

デコレータの値は静的なので、設定された優先度をここで反映する。

#### 戻り値

`void`

#### 上書き

[`StreamProvider`](../../music/classes/StreamProvider.md).[`onLoad`](../../music/classes/StreamProvider.md#onload)

***

### onUnload()? \{#onunload}

```ts
optional onUnload(): unknown;
```

定義: [src/component/Component.ts:58](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L58)

ストアから取り除かれるときに呼ばれます(クライアント終了時を含む)。

#### 戻り値

`unknown`

#### 継承元

[`StreamProvider`](../../music/classes/StreamProvider.md).[`onUnload`](../../music/classes/StreamProvider.md#onunload)

***

### stream() \{#stream}

```ts
stream(track): Promise<AudioStream>;
```

定義: [plugins/music-sources/src/youtube/YouTubeStreamProvider.ts:25](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/youtube/YouTubeStreamProvider.ts#L25)

トラックの音声ストリームを開きます。

#### パラメータ

##### track

[`Track`](../../music/interfaces/Track.md)

#### 戻り値

`Promise`\<[`AudioStream`](../../music/interfaces/AudioStream.md)\>

#### 上書き

[`StreamProvider`](../../music/classes/StreamProvider.md).[`stream`](../../music/classes/StreamProvider.md#stream)

***

### define() \{#define}

```ts
static define(options?): (_target, context) => void;
```

定義: [plugins/music/src/StreamProvider.ts:59](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/StreamProvider.ts#L59)

#### パラメータ

##### options?

[`StreamProviderOptions`](../../music/interfaces/StreamProviderOptions.md) = `{}`

#### 戻り値

(`_target`, `context`) => `void`

#### 継承元

[`StreamProvider`](../../music/classes/StreamProvider.md).[`define`](../../music/classes/StreamProvider.md#define)
