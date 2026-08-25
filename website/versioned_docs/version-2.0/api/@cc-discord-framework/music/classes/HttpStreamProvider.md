# クラス: HttpStreamProvider

定義: [plugins/music/src/builtin/HttpStreamProvider.ts:262](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/builtin/HttpStreamProvider.ts#L262)

http(s) URL から音声を取得する既定のプロバイダー。
直リンク・オブジェクトストレージ・Icecast/Shoutcast ラジオに対応します。

## 拡張

- [`StreamProvider`](StreamProvider.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new HttpStreamProvider(): HttpStreamProvider;
```

#### 戻り値

`HttpStreamProvider`

#### 継承元

[`StreamProvider`](StreamProvider.md).[`constructor`](StreamProvider.md#constructor)

## プロパティ

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/Component.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L30)

フレームワーク共有サービスを持つコンテナ。

#### 継承元

[`StreamProvider`](StreamProvider.md).[`container`](StreamProvider.md#container)

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: [src/component/Component.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L39)

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

#### 継承元

[`StreamProvider`](StreamProvider.md).[`location`](StreamProvider.md#location)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/Component.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L36)

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

#### 継承元

[`StreamProvider`](StreamProvider.md).[`logger`](StreamProvider.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/Component.ts:27](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L27)

ストア内で一意なコンポーネント名。

#### 継承元

[`StreamProvider`](StreamProvider.md).[`name`](StreamProvider.md#name)

***

### priority \{#priority}

```ts
readonly priority: number;
```

定義: [plugins/music/src/StreamProvider.ts:57](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/StreamProvider.ts#L57)

#### 継承元

[`StreamProvider`](StreamProvider.md).[`priority`](StreamProvider.md#priority)

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: [src/component/Component.ts:33](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L33)

このコンポーネントが属するストア。

#### 継承元

[`StreamProvider`](StreamProvider.md).[`store`](StreamProvider.md#store)

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

[`StreamProvider`](StreamProvider.md).[`client`](StreamProvider.md#client)

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

[`StreamProvider`](StreamProvider.md).[`services`](StreamProvider.md#services)

## メソッド

### canStream() \{#canstream}

```ts
canStream(track): boolean;
```

定義: [plugins/music/src/builtin/HttpStreamProvider.ts:263](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/builtin/HttpStreamProvider.ts#L263)

このトラックを再生できるか。副作用のない高速な判定にしてください。

#### パラメータ

##### track

[`Track`](../interfaces/Track.md)

#### 戻り値

`boolean`

#### 上書き

[`StreamProvider`](StreamProvider.md).[`canStream`](StreamProvider.md#canstream)

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

[`StreamProvider`](StreamProvider.md).[`onLoad`](StreamProvider.md#onload)

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

[`StreamProvider`](StreamProvider.md).[`onUnload`](StreamProvider.md#onunload)

***

### stream() \{#stream}

```ts
stream(track, context?): Promise<AudioStream>;
```

定義: [plugins/music/src/builtin/HttpStreamProvider.ts:267](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/builtin/HttpStreamProvider.ts#L267)

トラックの音声ストリームを開きます。

#### パラメータ

##### track

[`Track`](../interfaces/Track.md)

##### context?

[`StreamOpenContext`](../interfaces/StreamOpenContext.md) = `{}`

#### 戻り値

`Promise`\<[`AudioStream`](../interfaces/AudioStream.md)\>

#### 上書き

[`StreamProvider`](StreamProvider.md).[`stream`](StreamProvider.md#stream)

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

#### 継承元

[`StreamProvider`](StreamProvider.md).[`define`](StreamProvider.md#define)
