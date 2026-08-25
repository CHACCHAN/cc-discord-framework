# 抽象 クラス: TrackResolver

定義: [plugins/music/src/TrackResolver.ts:41](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/TrackResolver.ts#L41)

入力(URL・検索クエリ)を [Track](../interfaces/Track.md) へ解決するコンポーネント。
`resolvers/` ディレクトリに置くと自動ロードされます。

**メタデータ専用ソースも Resolver として表現できます。** 例えば Spotify は
DRM により直接再生できませんが、Resolver として曲情報(ISRC 付き)を返せば、
実際の音声は別の [StreamProvider](StreamProvider.md) が担当できます。

```ts
@TrackResolver.define({ priority: 10 })
export class MyResolver extends TrackResolver {
  canResolve(query: string) { return query.startsWith("https://example.com/"); }
  async resolve({ query, requestedBy }: ResolveContext) {
    return [createTrack({ title: "...", url: query, source: this.name, requestedBy })];
  }
}
```

## 拡張

- [`Component`](../../core/classes/Component.md)

## によって拡張された

- [`UrlResolver`](UrlResolver.md)
- [`ArchiveResolver`](ArchiveResolver.md)
- [`LocalFileResolver`](LocalFileResolver.md)
- [`SoundCloudResolver`](../../music-sources/classes/SoundCloudResolver.md)
- [`YouTubeResolver`](../../music-sources/classes/YouTubeResolver.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new TrackResolver(): TrackResolver;
```

#### 戻り値

`TrackResolver`

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

定義: [plugins/music/src/TrackResolver.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/TrackResolver.ts#L42)

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

### canResolve() \{#canresolve}

```ts
abstract canResolve(query): boolean;
```

定義: [plugins/music/src/TrackResolver.ts:49](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/TrackResolver.ts#L49)

この Resolver がクエリを扱えるか。副作用のない高速な判定にしてください。

#### パラメータ

##### query

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

### resolve() \{#resolve}

```ts
abstract resolve(context): Awaitable<Track[]>;
```

定義: [plugins/music/src/TrackResolver.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/TrackResolver.ts#L55)

クエリをトラックへ解決します。プレイリストなら複数返します。
空配列を返すと、次に優先度の高い Resolver が試されます。

#### パラメータ

##### context

[`ResolveContext`](../interfaces/ResolveContext.md)

#### 戻り値

`Awaitable`\<[`Track`](../interfaces/Track.md)[]\>

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
