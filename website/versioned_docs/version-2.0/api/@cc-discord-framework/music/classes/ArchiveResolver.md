# クラス: ArchiveResolver

定義: [plugins/music/src/builtin/ArchiveResolver.ts:31](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/builtin/ArchiveResolver.ts#L31)

Internet Archive(archive.org)のアイテムを解決します。

パブリックドメイン・Creative Commons・公認ライブ音源(Live Music Archive)
などを、スクレイピングなしの公式 API 経由で扱えます。

## 拡張

- [`TrackResolver`](TrackResolver.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new ArchiveResolver(): ArchiveResolver;
```

#### 戻り値

`ArchiveResolver`

#### 継承元

[`TrackResolver`](TrackResolver.md).[`constructor`](TrackResolver.md#constructor)

## プロパティ

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/Component.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L30)

フレームワーク共有サービスを持つコンテナ。

#### 継承元

[`TrackResolver`](TrackResolver.md).[`container`](TrackResolver.md#container)

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: [src/component/Component.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L39)

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

#### 継承元

[`TrackResolver`](TrackResolver.md).[`location`](TrackResolver.md#location)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/Component.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L36)

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

#### 継承元

[`TrackResolver`](TrackResolver.md).[`logger`](TrackResolver.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/Component.ts:27](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L27)

ストア内で一意なコンポーネント名。

#### 継承元

[`TrackResolver`](TrackResolver.md).[`name`](TrackResolver.md#name)

***

### priority \{#priority}

```ts
readonly priority: number;
```

定義: [plugins/music/src/TrackResolver.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/TrackResolver.ts#L42)

#### 継承元

[`TrackResolver`](TrackResolver.md).[`priority`](TrackResolver.md#priority)

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: [src/component/Component.ts:33](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L33)

このコンポーネントが属するストア。

#### 継承元

[`TrackResolver`](TrackResolver.md).[`store`](TrackResolver.md#store)

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

[`TrackResolver`](TrackResolver.md).[`client`](TrackResolver.md#client)

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

[`TrackResolver`](TrackResolver.md).[`services`](TrackResolver.md#services)

## メソッド

### canResolve() \{#canresolve}

```ts
canResolve(query): boolean;
```

定義: [plugins/music/src/builtin/ArchiveResolver.ts:32](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/builtin/ArchiveResolver.ts#L32)

この Resolver がクエリを扱えるか。副作用のない高速な判定にしてください。

#### パラメータ

##### query

`string`

#### 戻り値

`boolean`

#### 上書き

[`TrackResolver`](TrackResolver.md).[`canResolve`](TrackResolver.md#canresolve)

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

[`TrackResolver`](TrackResolver.md).[`onLoad`](TrackResolver.md#onload)

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

[`TrackResolver`](TrackResolver.md).[`onUnload`](TrackResolver.md#onunload)

***

### resolve() \{#resolve}

```ts
resolve(__namedParameters): Promise<Track[]>;
```

定義: [plugins/music/src/builtin/ArchiveResolver.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/builtin/ArchiveResolver.ts#L36)

クエリをトラックへ解決します。プレイリストなら複数返します。
空配列を返すと、次に優先度の高い Resolver が試されます。

#### パラメータ

##### \_\_namedParameters

[`ResolveContext`](../interfaces/ResolveContext.md)

#### 戻り値

`Promise`\<[`Track`](../interfaces/Track.md)[]\>

#### 上書き

[`TrackResolver`](TrackResolver.md).[`resolve`](TrackResolver.md#resolve)

***

### define() \{#define}

```ts
static define(options?): (_target, context) => void;
```

定義: [plugins/music/src/TrackResolver.ts:44](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/TrackResolver.ts#L44)

#### パラメータ

##### options?

[`TrackResolverOptions`](../interfaces/TrackResolverOptions.md) = `{}`

#### 戻り値

(`_target`, `context`) => `void`

#### 継承元

[`TrackResolver`](TrackResolver.md).[`define`](TrackResolver.md#define)
