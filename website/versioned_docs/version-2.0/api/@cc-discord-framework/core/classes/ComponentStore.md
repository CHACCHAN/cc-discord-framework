# クラス: ComponentStore\<T\>

定義: [src/component/ComponentStore.ts:45](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L45)

1種別のロード済みコンポーネントを保持し、そのロード方法を知るストア。

ストアは拡張の単位です: プラグインは `ComponentStore` をサブクラス化して
[StoreRegistry](StoreRegistry.md) に登録し、[ComponentStore.bind](#bind) /
[ComponentStore.unbind](#unbind) をオーバーライドすることで、新しい
コンポーネント種別を丸ごと追加できます。

ストアは discord.js の `Collection` を継承しているため、その検索・走査
ユーティリティがそのまま使えます(`store.get(name)`、`store.filter`、
`store.map`、...)。

## 拡張

- `Collection`\<`string`, `T`\>

## によって拡張された

- [`ServiceStore`](ServiceStore.md)
- [`CommandStore`](CommandStore.md)
- [`ListenerStore`](ListenerStore.md)
- [`PreconditionStore`](PreconditionStore.md)
- [`TaskStore`](../../utils/classes/TaskStore.md)
- [`StreamProviderStore`](../../music/classes/StreamProviderStore.md)
- [`TrackResolverStore`](../../music/classes/TrackResolverStore.md)
- [`AiToolStore`](../../ai/classes/AiToolStore.md)

## 型パラメーター

### T

`T` *extends* [`Component`](Component.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new ComponentStore<T>(options): ComponentStore<T>;
```

定義: [src/component/ComponentStore.ts:64](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L64)

#### パラメータ

##### options

[`ComponentStoreOptions`](../interfaces/ComponentStoreOptions.md)\<`T`\>

#### 戻り値

`ComponentStore`\<`T`\>

#### 上書き

```ts
Collection<string, T>.constructor
```

## プロパティ

### base \{#base}

```ts
readonly base: AbstractComponentClass<T>;
```

定義: [src/component/ComponentStore.ts:50](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L50)

この種別のコンポーネントが継承する基底クラス。

***

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/ComponentStore.ts:56](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L56)

コンテナ。レジストリへの登録時に割り当てられます。

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/ComponentStore.ts:59](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L59)

このストア用の子ロガー。登録時に割り当てられます。

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/ComponentStore.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L47)

ストア名(= 自動探索ディレクトリ名)。

***

### suffix \{#suffix}

```ts
readonly suffix: string;
```

定義: [src/component/ComponentStore.ts:53](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L53)

クラス名から取り除く接尾辞([ComponentStoreOptions.suffix](../interfaces/ComponentStoreOptions.md#suffix))。

## メソッド

### applyOptions() \{#applyoptions}

```ts
protected applyOptions(component, options): void;
```

定義: [src/component/ComponentStore.ts:238](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L238)

解決済みメタデータをインスタンスへ適用します — 種別固有フィールドの
割り当てと必須項目の検証はここで行います。ロード時に弾く場合は
([ComponentLoadError](ComponentLoadError.md) を推奨)例外を投げてください。

#### パラメータ

##### component

`T`

##### options

[`ComponentOptions`](../interfaces/ComponentOptions.md)

#### 戻り値

`void`

***

### bind() \{#bind}

```ts
protected bind(component): void;
```

定義: [src/component/ComponentStore.ts:247](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L247)

ロード済みコンポーネントをランタイムへ配線します(例: リスナーの
イベント購読)。`onLoad` の後、ストアに追加された状態で呼ばれます。

#### パラメータ

##### component

`T`

#### 戻り値

`void`

***

### deriveName() \{#derivename}

```ts
protected deriveName(className): string;
```

定義: [src/component/ComponentStore.ts:229](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L229)

クラス名からコンポーネント名を導出します: 種別サフィックス
([ComponentStore.suffix](#suffix))を取り除き、ケバブケース化します
(`UserInfoCommand` → `user-info`)。
カスタム種別で慣例を変えたい場合はオーバーライドしてください。

#### パラメータ

##### className

`string`

#### 戻り値

`string`

***

### load() \{#load}

```ts
load(cls, location?): Promise<T>;
```

定義: [src/component/ComponentStore.ts:122](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L122)

単一のコンポーネントクラスを構築・初期化・追加します。
同じクラスの二重ロードは既存インスタンスを返すだけで無害です。
**別の** クラスが既存の名前に解決された場合は
[ComponentLoadError](ComponentLoadError.md) を投げます。

#### パラメータ

##### cls

[`ComponentClass`](../type-aliases/ComponentClass.md)\<`T`\>

##### location?

`string` \| `null`

#### 戻り値

`Promise`\<`T`\>

***

### loadAll() \{#loadall}

```ts
loadAll(baseDirectory): Promise<void>;
```

定義: [src/component/ComponentStore.ts:95](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L95)

この種別のすべてのコンポーネントをロードします: 先に明示登録分、
次に `<baseDirectory>/<name>` のファイル自動探索(baseDirectory 設定時)。
クライアント起動時にレジストリから呼ばれます。

#### パラメータ

##### baseDirectory

`string` \| `null`

#### 戻り値

`Promise`\<`void`\>

***

### register() \{#register}

```ts
register(...classes): this;
```

定義: [src/component/ComponentStore.ts:77](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L77)

コンポーネントクラスを明示登録します(ファイル自動探索の代替)。
[ComponentStore.loadAll](#loadall) 前ならキューに積まれ、後なら即座に
ロードされます(fire-and-forget — インスタンスを待つ場合は
[ComponentStore.load](#load) を使ってください)。

#### パラメータ

##### classes

...[`ComponentClass`](../type-aliases/ComponentClass.md)\<`T`\>[]

#### 戻り値

`this`

***

### unbind() \{#unbind}

```ts
protected unbind(component): void;
```

定義: [src/component/ComponentStore.ts:252](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L252)

[ComponentStore.bind](#bind) の逆操作。アンロード時に呼ばれます。

#### パラメータ

##### component

`T`

#### 戻り値

`void`

***

### unload() \{#unload}

```ts
unload(resolvable): Promise<T>;
```

定義: [src/component/ComponentStore.ts:200](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L200)

コンポーネントを取り除きます([ComponentStore.unbind](#unbind) と `onUnload` を実行)。

#### パラメータ

##### resolvable

`string` \| `T`

#### 戻り値

`Promise`\<`T`\>

***

### unloadAll() \{#unloadall}

```ts
unloadAll(): Promise<void>;
```

定義: [src/component/ComponentStore.ts:217](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L217)

このストアのすべてのコンポーネントをアンロードします(クライアント終了時に使用)。

#### 戻り値

`Promise`\<`void`\>
