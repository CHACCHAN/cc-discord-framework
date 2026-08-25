# 抽象 クラス: StreamProvider

定義: [plugins/music/src/StreamProvider.ts:56](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/StreamProvider.ts#L56)

[Track](../interfaces/Track.md) を実際の音声ストリームへ変換するコンポーネント。
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

- [`Component`](../../core/classes/Component.md)

## によって拡張された

- [`HttpStreamProvider`](HttpStreamProvider.md)
- [`LocalFileStreamProvider`](LocalFileStreamProvider.md)
- [`SoundCloudStreamProvider`](../../music-sources/classes/SoundCloudStreamProvider.md)
- [`YouTubeStreamProvider`](../../music-sources/classes/YouTubeStreamProvider.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new StreamProvider(): StreamProvider;
```

#### 戻り値

`StreamProvider`

#### 継承元

[`Component`](../../core/classes/Component.md).[`constructor`](../../core/classes/Component.md#constructor)

## プロパティ

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/Component.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L30)

フレームワーク共有サービスを持つコンテナ。

#### 継承元

[`Component`](../../core/classes/Component.md).[`container`](../../core/classes/Component.md#container)

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: [src/component/Component.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L39)

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

#### 継承元

[`Component`](../../core/classes/Component.md).[`location`](../../core/classes/Component.md#location)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/Component.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L36)

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

#### 継承元

[`Component`](../../core/classes/Component.md).[`logger`](../../core/classes/Component.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/Component.ts:27](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L27)

ストア内で一意なコンポーネント名。

#### 継承元

[`Component`](../../core/classes/Component.md).[`name`](../../core/classes/Component.md#name)

***

### priority \{#priority}

```ts
readonly priority: number;
```

定義: [plugins/music/src/StreamProvider.ts:57](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/StreamProvider.ts#L57)

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: [src/component/Component.ts:33](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L33)

このコンポーネントが属するストア。

#### 継承元

[`Component`](../../core/classes/Component.md).[`store`](../../core/classes/Component.md#store)

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

[`Component`](../../core/classes/Component.md).[`client`](../../core/classes/Component.md#client)

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

[`Component`](../../core/classes/Component.md).[`services`](../../core/classes/Component.md#services)

## メソッド

### canStream() \{#canstream}

```ts
abstract canStream(track): boolean;
```

定義: [plugins/music/src/StreamProvider.ts:64](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/StreamProvider.ts#L64)

このトラックを再生できるか。副作用のない高速な判定にしてください。

#### パラメータ

##### track

[`Track`](../interfaces/Track.md)

#### 戻り値

`boolean`

***

### onLoad()? \{#onload}

```ts
optional onLoad(): unknown;
```

定義: [src/component/Component.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L55)

初期化後・ストア追加前に呼ばれます。

#### 戻り値

`unknown`

#### 継承元

[`Component`](../../core/classes/Component.md).[`onLoad`](../../core/classes/Component.md#onload)

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

[`Component`](../../core/classes/Component.md).[`onUnload`](../../core/classes/Component.md#onunload)

***

### stream() \{#stream}

```ts
abstract stream(track, context?): Awaitable<AudioStream>;
```

定義: [plugins/music/src/StreamProvider.ts:67](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/StreamProvider.ts#L67)

トラックの音声ストリームを開きます。

#### パラメータ

##### track

[`Track`](../interfaces/Track.md)

##### context?

[`StreamOpenContext`](../interfaces/StreamOpenContext.md)

#### 戻り値

`Awaitable`\<[`AudioStream`](../interfaces/AudioStream.md)\>

***

### define() \{#define}

```ts
static define(options?): (_target, context) => void;
```

定義: [plugins/music/src/StreamProvider.ts:59](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/StreamProvider.ts#L59)

#### パラメータ

##### options?

[`StreamProviderOptions`](../interfaces/StreamProviderOptions.md) = `{}`

#### 戻り値

(`_target`, `context`) => `void`
