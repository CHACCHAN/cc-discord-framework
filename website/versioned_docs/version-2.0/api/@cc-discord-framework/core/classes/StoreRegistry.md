# クラス: StoreRegistry

定義: [src/component/StoreRegistry.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/StoreRegistry.ts#L39)

クライアントが持つ全コンポーネントストアの集合。

コア種別(`services` / `commands` / `listeners` / `preconditions`)は
クライアント自身が登録し、追加のストアはプラグインが install 時に
登録します。

## 実装

- `Iterable`\<[`ComponentStore`](ComponentStore.md)\<[`Component`](Component.md)\>\>

## メソッド

### \[iterator\]() \{#iterator}

```ts
iterator: Iterator<ComponentStore<Component>>;
```

定義: [src/component/StoreRegistry.ts:103](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/StoreRegistry.ts#L103)

#### 戻り値

`Iterator`\<[`ComponentStore`](ComponentStore.md)\<[`Component`](Component.md)\>\>

#### の実装

```ts
Iterable.[iterator]
```

***

### get() \{#get}

#### コールシグネチャ

```ts
get<K>(name): Stores[K];
```

定義: [src/component/StoreRegistry.ts:62](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/StoreRegistry.ts#L62)

ストアを名前で取得します。[Stores](../interfaces/Stores.md) インターフェースにより型付けされます。

##### 型パラメーター

###### K

`K` *extends* keyof [`Stores`](../interfaces/Stores.md)

##### パラメータ

###### name

`K`

##### 戻り値

[`Stores`](../interfaces/Stores.md)\[`K`\]

#### コールシグネチャ

```ts
get(name): 
  | ComponentStore<Component>
  | undefined;
```

定義: [src/component/StoreRegistry.ts:63](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/StoreRegistry.ts#L63)

ストアを名前で取得します。[Stores](../interfaces/Stores.md) インターフェースにより型付けされます。

##### パラメータ

###### name

`string`

##### 戻り値

  \| [`ComponentStore`](ComponentStore.md)\<[`Component`](Component.md)\>
  \| `undefined`

***

### loadAll() \{#loadall}

```ts
loadAll(baseDirectory): Promise<void>;
```

定義: [src/component/StoreRegistry.ts:90](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/StoreRegistry.ts#L90)

すべてのストアを登録順に順次ロードします。ロード時のイベントと失敗を
決定的にするためです。

#### パラメータ

##### baseDirectory

`string` \| `null`

#### 戻り値

`Promise`\<`void`\>

***

### register() \{#register}

```ts
register(store): this;
```

定義: [src/component/StoreRegistry.ts:49](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/StoreRegistry.ts#L49)

ストアを登録します。クライアントのロード前に行ってください(プラグインの install で間に合います)。

#### パラメータ

##### store

[`ComponentStore`](ComponentStore.md)\<[`Component`](Component.md)\>

#### 戻り値

`this`

***

### resolve() \{#resolve}

```ts
resolve(cls): ComponentStore<Component>;
```

定義: [src/component/StoreRegistry.ts:72](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/StoreRegistry.ts#L72)

コンポーネントクラスの担当ストアをプロトタイプチェーンから解決します。
基底クラスが入れ子の場合は、より具体的なストアが優先されます。

#### パラメータ

##### cls

[`ComponentClass`](../type-aliases/ComponentClass.md)\<[`Component`](Component.md)\>

#### 戻り値

[`ComponentStore`](ComponentStore.md)\<[`Component`](Component.md)\>

***

### unloadAll() \{#unloadall}

```ts
unloadAll(): Promise<void>;
```

定義: [src/component/StoreRegistry.ts:97](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/StoreRegistry.ts#L97)

すべてのストアのコンポーネントを登録の逆順にアンロードします。

#### 戻り値

`Promise`\<`void`\>
