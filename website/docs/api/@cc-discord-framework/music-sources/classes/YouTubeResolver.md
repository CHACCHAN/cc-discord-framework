# クラス: YouTubeResolver

定義: plugins/music-sources/src/youtube/YouTubeResolver.ts:20

入力(URL・検索クエリ)を [Track](../../music/interfaces/Track.md) へ解決するコンポーネント。
`resolvers/` ディレクトリに置くと自動ロードされます。

**メタデータ専用ソースも Resolver として表現できます。** 例えば Spotify は
DRM により直接再生できませんが、Resolver として曲情報(ISRC 付き)を返せば、
実際の音声は別の [StreamProvider](../../music/classes/StreamProvider.md) が担当できます。

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

- [`TrackResolver`](../../music/classes/TrackResolver.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new YouTubeResolver(): YouTubeResolver;
```

#### 戻り値

`YouTubeResolver`

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`constructor`](../../music/classes/TrackResolver.md#constructor)

## プロパティ

### container \{#container}

```ts
readonly container: Container;
```

定義: src/component/Component.ts:30

フレームワーク共有サービスを持つコンテナ。

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`container`](../../music/classes/TrackResolver.md#container)

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: src/component/Component.ts:39

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`location`](../../music/classes/TrackResolver.md#location)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: src/component/Component.ts:36

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`logger`](../../music/classes/TrackResolver.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: src/component/Component.ts:27

ストア内で一意なコンポーネント名。

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`name`](../../music/classes/TrackResolver.md#name)

***

### priority \{#priority}

```ts
readonly priority: number;
```

定義: plugins/music/src/TrackResolver.ts:42

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`priority`](../../music/classes/TrackResolver.md#priority)

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: src/component/Component.ts:33

このコンポーネントが属するストア。

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`store`](../../music/classes/TrackResolver.md#store)

## アクセッサー

### client \{#client}

#### 署名を取得する

```ts
get client(): Client;
```

定義: src/component/Component.ts:42

フレームワーククライアント。

##### 戻り値

[`Client`](../../../cc-discord-framework/classes/Client.md)

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`client`](../../music/classes/TrackResolver.md#client)

***

### config \{#config}

#### 署名を取得する

```ts
get config(): YouTubeConfig;
```

定義: plugins/music-sources/src/youtube/YouTubeResolver.ts:25

##### 戻り値

[`YouTubeConfig`](../interfaces/YouTubeConfig.md)

***

### services \{#services}

#### 署名を取得する

```ts
get services(): Services;
```

定義: src/component/Component.ts:50

ロード済みサービスへのアクセス(`services/` から自動収束)。
import せずに `this.services.<名前>` で参照できます。

##### 戻り値

[`Services`](../../../cc-discord-framework/interfaces/Services.md)

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`services`](../../music/classes/TrackResolver.md#services)

## メソッド

### canResolve() \{#canresolve}

```ts
canResolve(query): boolean;
```

定義: plugins/music-sources/src/youtube/YouTubeResolver.ts:34

この Resolver がクエリを扱えるか。副作用のない高速な判定にしてください。

#### パラメータ

##### query

`string`

#### 戻り値

`boolean`

#### 上書き

[`TrackResolver`](../../music/classes/TrackResolver.md).[`canResolve`](../../music/classes/TrackResolver.md#canresolve)

***

### onLoad() \{#onload}

```ts
onLoad(): void;
```

定義: plugins/music-sources/src/youtube/YouTubeResolver.ts:30

デコレータの値は静的なので、設定された優先度をここで反映する。

#### 戻り値

`void`

#### 上書き

[`TrackResolver`](../../music/classes/TrackResolver.md).[`onLoad`](../../music/classes/TrackResolver.md#onload)

***

### onUnload()? \{#onunload}

```ts
optional onUnload(): unknown;
```

定義: src/component/Component.ts:58

ストアから取り除かれるときに呼ばれます(クライアント終了時を含む)。

#### 戻り値

`unknown`

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`onUnload`](../../music/classes/TrackResolver.md#onunload)

***

### resolve() \{#resolve}

```ts
resolve(context): Promise<Track[]>;
```

定義: plugins/music-sources/src/youtube/YouTubeResolver.ts:40

クエリをトラックへ解決します。プレイリストなら複数返します。
空配列を返すと、次に優先度の高い Resolver が試されます。

#### パラメータ

##### context

[`ResolveContext`](../../music/interfaces/ResolveContext.md)

#### 戻り値

`Promise`\<[`Track`](../../music/interfaces/Track.md)[]\>

#### 上書き

[`TrackResolver`](../../music/classes/TrackResolver.md).[`resolve`](../../music/classes/TrackResolver.md#resolve)

***

### define() \{#define}

```ts
static define(options?): (_target, context) => void;
```

定義: plugins/music/src/TrackResolver.ts:44

#### パラメータ

##### options?

[`TrackResolverOptions`](../../music/interfaces/TrackResolverOptions.md) = `{}`

#### 戻り値

(`_target`, `context`) => `void`

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`define`](../../music/classes/TrackResolver.md#define)
