# 抽象 クラス: Component

定義: src/component/Component.ts:25

フレームワークにロードされるあらゆる単位の基底クラス。

コンポーネントは **引数なし** で構築されます — コンストラクタ引数を
宣言しないでください。構築直後にフレームワークが `name` / `container` /
`store` / `logger` / `location` を初期化し、その後 [Component.onLoad](#onload)
を呼びます。フレームワークのサービスが必要な初期化はコンストラクタでは
なく `onLoad` で行ってください。

## によって拡張された

- [`Service`](Service.md)
- [`Command`](Command.md)
- [`Listener`](Listener.md)
- [`Precondition`](Precondition.md)
- [`Task`](../../@cc-discord-framework/utils/classes/Task.md)
- [`StreamProvider`](../../@cc-discord-framework/music/classes/StreamProvider.md)
- [`TrackResolver`](../../@cc-discord-framework/music/classes/TrackResolver.md)
- [`AiTool`](../../@cc-discord-framework/ai/classes/AiTool.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new Component(): Component;
```

#### 戻り値

`Component`

## プロパティ

### container \{#container}

```ts
readonly container: Container;
```

定義: src/component/Component.ts:30

フレームワーク共有サービスを持つコンテナ。

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: src/component/Component.ts:39

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: src/component/Component.ts:36

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

***

### name \{#name}

```ts
readonly name: string;
```

定義: src/component/Component.ts:27

ストア内で一意なコンポーネント名。

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: src/component/Component.ts:33

このコンポーネントが属するストア。

## アクセッサー

### client \{#client}

#### 署名を取得する

```ts
get client(): Client;
```

定義: src/component/Component.ts:42

フレームワーククライアント。

##### 戻り値

[`Client`](Client.md)

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

[`Services`](../interfaces/Services.md)

## メソッド

### onLoad()? \{#onload}

```ts
optional onLoad(): unknown;
```

定義: src/component/Component.ts:55

初期化後・ストア追加前に呼ばれます。

#### 戻り値

`unknown`

***

### onUnload()? \{#onunload}

```ts
optional onUnload(): unknown;
```

定義: src/component/Component.ts:58

ストアから取り除かれるときに呼ばれます(クライアント終了時を含む)。

#### 戻り値

`unknown`
