# クラス: MapMemoryStore

定義: plugins/ai/src/memory.ts:53

Map ベースの既定実装。プロセスが生きているあいだだけ覚えています。

**タイマーは持ちません** — TTL 切れは取得時に捨てるだけなので、
クライアントを終了させるのに後始末が要りません。

## 実装

- [`AiMemoryStore`](../interfaces/AiMemoryStore.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new MapMemoryStore(options?): MapMemoryStore;
```

定義: plugins/ai/src/memory.ts:58

#### パラメータ

##### options?

[`MapMemoryStoreOptions`](../interfaces/MapMemoryStoreOptions.md) = `{}`

#### 戻り値

`MapMemoryStore`

## アクセッサー

### size \{#size}

#### 署名を取得する

```ts
get size(): number;
```

定義: plugins/ai/src/memory.ts:91

覚えているキーの数(テストと診断のため)。

##### 戻り値

`number`

## メソッド

### append() \{#append}

```ts
append(key, messages): void;
```

定義: plugins/ai/src/memory.ts:73

キーの履歴の末尾へ追記します。

#### パラメータ

##### key

`string`

##### messages

readonly `ModelMessage`[]

#### 戻り値

`void`

#### の実装

[`AiMemoryStore`](../interfaces/AiMemoryStore.md).[`append`](../interfaces/AiMemoryStore.md#append)

***

### clear() \{#clear}

```ts
clear(key): void;
```

定義: plugins/ai/src/memory.ts:86

キーの履歴を消します。

#### パラメータ

##### key

`string`

#### 戻り値

`void`

#### の実装

[`AiMemoryStore`](../interfaces/AiMemoryStore.md).[`clear`](../interfaces/AiMemoryStore.md#clear)

***

### get() \{#get}

```ts
get(key): ModelMessage[];
```

定義: plugins/ai/src/memory.ts:63

キーの履歴を古い順に返します。無ければ空配列。

#### パラメータ

##### key

`string`

#### 戻り値

`ModelMessage`[]

#### の実装

[`AiMemoryStore`](../interfaces/AiMemoryStore.md).[`get`](../interfaces/AiMemoryStore.md#get)
