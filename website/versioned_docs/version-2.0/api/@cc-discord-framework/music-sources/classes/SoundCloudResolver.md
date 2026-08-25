# クラス: SoundCloudResolver

定義: [plugins/music-sources/src/soundcloud/SoundCloudResolver.ts:41](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/soundcloud/SoundCloudResolver.ts#L41)

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
new SoundCloudResolver(): SoundCloudResolver;
```

#### 戻り値

`SoundCloudResolver`

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`constructor`](../../music/classes/TrackResolver.md#constructor)

## プロパティ

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/Component.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L30)

フレームワーク共有サービスを持つコンテナ。

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`container`](../../music/classes/TrackResolver.md#container)

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: [src/component/Component.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L39)

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`location`](../../music/classes/TrackResolver.md#location)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/Component.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L36)

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`logger`](../../music/classes/TrackResolver.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/Component.ts:27](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L27)

ストア内で一意なコンポーネント名。

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`name`](../../music/classes/TrackResolver.md#name)

***

### priority \{#priority}

```ts
readonly priority: number;
```

定義: [plugins/music/src/TrackResolver.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/TrackResolver.ts#L42)

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`priority`](../../music/classes/TrackResolver.md#priority)

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: [src/component/Component.ts:33](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L33)

このコンポーネントが属するストア。

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`store`](../../music/classes/TrackResolver.md#store)

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

[`TrackResolver`](../../music/classes/TrackResolver.md).[`client`](../../music/classes/TrackResolver.md#client)

***

### config \{#config}

#### 署名を取得する

```ts
get config(): SoundCloudConfig;
```

定義: [plugins/music-sources/src/soundcloud/SoundCloudResolver.ts:44](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/soundcloud/SoundCloudResolver.ts#L44)

##### 戻り値

[`SoundCloudConfig`](../interfaces/SoundCloudConfig.md)

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

[`TrackResolver`](../../music/classes/TrackResolver.md).[`services`](../../music/classes/TrackResolver.md#services)

***

### soundcloud \{#soundcloud}

#### 署名を取得する

```ts
get soundcloud(): Soundcloud;
```

定義: [plugins/music-sources/src/soundcloud/SoundCloudResolver.ts:54](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/soundcloud/SoundCloudResolver.ts#L54)

SoundCloud のクライアント(`client` は Component が持つ Discord のもの)。

##### 戻り値

`Soundcloud`

## メソッド

### canResolve() \{#canresolve}

```ts
canResolve(query): boolean;
```

定義: [plugins/music-sources/src/soundcloud/SoundCloudResolver.ts:59](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/soundcloud/SoundCloudResolver.ts#L59)

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

定義: [plugins/music-sources/src/soundcloud/SoundCloudResolver.ts:49](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/soundcloud/SoundCloudResolver.ts#L49)

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

定義: [src/component/Component.ts:58](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L58)

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

定義: [plugins/music-sources/src/soundcloud/SoundCloudResolver.ts:65](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music-sources/src/soundcloud/SoundCloudResolver.ts#L65)

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

定義: [plugins/music/src/TrackResolver.ts:44](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/TrackResolver.ts#L44)

#### パラメータ

##### options?

[`TrackResolverOptions`](../../music/interfaces/TrackResolverOptions.md) = `{}`

#### 戻り値

(`_target`, `context`) => `void`

#### 継承元

[`TrackResolver`](../../music/classes/TrackResolver.md).[`define`](../../music/classes/TrackResolver.md#define)
