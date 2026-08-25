# クラス: AudioService

定義: [plugins/music/src/AudioService.ts:53](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/AudioService.ts#L53)

音楽再生のエントリポイント。`this.services.audio` で参照できます。

```ts
const { tracks } = await this.services.audio.play({
  channel: member.voice.channel,
  query: "https://example.com/song.opus",
  requestedBy: member.id,
});
```

## 拡張

- [`Service`](../../core/classes/Service.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new AudioService(): AudioService;
```

#### 戻り値

`AudioService`

#### 継承元

[`Service`](../../core/classes/Service.md).[`constructor`](../../core/classes/Service.md#constructor)

## プロパティ

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/Component.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L30)

フレームワーク共有サービスを持つコンテナ。

#### 継承元

[`Service`](../../core/classes/Service.md).[`container`](../../core/classes/Service.md#container)

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: [src/component/Component.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L39)

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

#### 継承元

[`Service`](../../core/classes/Service.md).[`location`](../../core/classes/Service.md#location)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/Component.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L36)

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

#### 継承元

[`Service`](../../core/classes/Service.md).[`logger`](../../core/classes/Service.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/Component.ts:27](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L27)

ストア内で一意なコンポーネント名。

#### 継承元

[`Service`](../../core/classes/Service.md).[`name`](../../core/classes/Service.md#name)

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: [src/component/Component.ts:33](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L33)

このコンポーネントが属するストア。

#### 継承元

[`Service`](../../core/classes/Service.md).[`store`](../../core/classes/Service.md#store)

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

[`Service`](../../core/classes/Service.md).[`client`](../../core/classes/Service.md#client)

***

### queues \{#queues}

#### 署名を取得する

```ts
get queues(): readonly GuildQueue[];
```

定義: [plugins/music/src/AudioService.ts:62](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/AudioService.ts#L62)

稼働中のすべてのキュー。

##### 戻り値

readonly [`GuildQueue`](GuildQueue.md)[]

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

[`Service`](../../core/classes/Service.md).[`services`](../../core/classes/Service.md#services)

## メソッド

### ensureQueue() \{#ensurequeue}

```ts
ensureQueue(guildId): GuildQueue;
```

定義: [plugins/music/src/AudioService.ts:67](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/AudioService.ts#L67)

ギルドのキューを取得し、なければ作成します(接続はしません)。

#### パラメータ

##### guildId

`string`

#### 戻り値

[`GuildQueue`](GuildQueue.md)

***

### leave() \{#leave}

```ts
leave(guildId): boolean;
```

定義: [plugins/music/src/AudioService.ts:135](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/AudioService.ts#L135)

ギルドの再生を停止して切断します。

#### パラメータ

##### guildId

`string`

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

[`Service`](../../core/classes/Service.md).[`onLoad`](../../core/classes/Service.md#onload)

***

### onUnload() \{#onunload}

```ts
onUnload(): void;
```

定義: [plugins/music/src/AudioService.ts:143](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/AudioService.ts#L143)

クライアント終了時、すべてのギルドから切断します。

#### 戻り値

`void`

#### 上書き

[`Service`](../../core/classes/Service.md).[`onUnload`](../../core/classes/Service.md#onunload)

***

### play() \{#play}

```ts
play(options): Promise<PlayResult>;
```

定義: [plugins/music/src/AudioService.ts:103](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/AudioService.ts#L103)

クエリを解決してキューへ追加し、必要なら接続・再生を開始します。

#### パラメータ

##### options

[`PlayOptions`](../interfaces/PlayOptions.md)

#### 戻り値

`Promise`\<[`PlayResult`](../interfaces/PlayResult.md)\>

#### Throws

NoResultError 再生可能な音源が見つからなかった場合。

***

### queue() \{#queue}

```ts
queue(guildId): GuildQueue | null;
```

定義: [plugins/music/src/AudioService.ts:57](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/AudioService.ts#L57)

ギルドの既存キューを返します。未接続なら `null`。

#### パラメータ

##### guildId

`string`

#### 戻り値

[`GuildQueue`](GuildQueue.md) \| `null`

***

### resolve() \{#resolve}

```ts
resolve(query, requestedBy?): Promise<Track[]>;
```

定義: [plugins/music/src/AudioService.ts:94](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/AudioService.ts#L94)

クエリを解決してトラックを返します(キューには追加しません)。
検索結果の選択 UI を自作したい場合に使います。

#### パラメータ

##### query

`string`

##### requestedBy?

`string` \| `null`

#### 戻り値

`Promise`\<[`Track`](../interfaces/Track.md)[]\>

***

### define() \{#define}

```ts
static define(options?): (_target, context) => void;
```

定義: [src/service/Service.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/service/Service.ts#L47)

サービスのメタデータを宣言します。省略可能です。

#### パラメータ

##### options?

[`ServiceOptions`](../../core/interfaces/ServiceOptions.md) = `{}`

#### 戻り値

(`_target`, `context`) => `void`

#### 継承元

[`Service`](../../core/classes/Service.md).[`define`](../../core/classes/Service.md#define)
