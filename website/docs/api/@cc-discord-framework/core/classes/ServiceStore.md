# クラス: ServiceStore

定義: [src/service/ServiceStore.ts:11](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/service/ServiceStore.ts#L11)

[Service](Service.md) コンポーネントのストア。`services/` を走査します。

サービスストアは最初にロードされるため、他のコンポーネントの `onLoad`
からもサービスを利用できます。ロード済みサービスは
`container.services` / `this.services` に名前で収束します。

## 拡張

- [`ComponentStore`](ComponentStore.md)\<[`Service`](Service.md)\>

## コンストラクター

### コンストラクター \{#constructor}

```ts
new ServiceStore(): ServiceStore;
```

定義: [src/service/ServiceStore.ts:14](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/service/ServiceStore.ts#L14)

#### 戻り値

`ServiceStore`

#### 上書き

[`ComponentStore`](ComponentStore.md).[`constructor`](ComponentStore.md#constructor)

## プロパティ

### base \{#base}

```ts
readonly base: AbstractComponentClass<Service>;
```

定義: [src/component/ComponentStore.ts:50](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L50)

この種別のコンポーネントが継承する基底クラス。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`base`](ComponentStore.md#base)

***

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/ComponentStore.ts:56](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L56)

コンテナ。レジストリへの登録時に割り当てられます。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`container`](ComponentStore.md#container)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/ComponentStore.ts:59](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L59)

このストア用の子ロガー。登録時に割り当てられます。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`logger`](ComponentStore.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/ComponentStore.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L47)

ストア名(= 自動探索ディレクトリ名)。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`name`](ComponentStore.md#name)

***

### suffix \{#suffix}

```ts
readonly suffix: string;
```

定義: [src/component/ComponentStore.ts:53](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L53)

クラス名から取り除く接尾辞([ComponentStoreOptions.suffix](../interfaces/ComponentStoreOptions.md#suffix))。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`suffix`](ComponentStore.md#suffix)

## アクセッサー

### registry \{#registry}

#### 署名を取得する

```ts
get registry(): Services;
```

定義: [src/service/ServiceStore.ts:23](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/service/ServiceStore.ts#L23)

`this.services.<名前>` としてアクセスされる名前付きレジストリ。
実体はロード時に埋まる動的なマップで、型は利用者の [Services](../interfaces/Services.md)
宣言マージが保証します。

##### 戻り値

[`Services`](../interfaces/Services.md)

## メソッド

### applyOptions() \{#applyoptions}

```ts
protected applyOptions(component, options): void;
```

定義: [src/component/ComponentStore.ts:238](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L238)

解決済みメタデータをインスタンスへ適用します — 種別固有フィールドの
割り当てと必須項目の検証はここで行います。ロード時に弾く場合は
([ComponentLoadError](ComponentLoadError.md) を推奨)例外を投げてください。

#### パラメータ

##### component

[`Service`](Service.md)

##### options

[`ComponentOptions`](../interfaces/ComponentOptions.md)

#### 戻り値

`void`

#### 継承元

[`ComponentStore`](ComponentStore.md).[`applyOptions`](ComponentStore.md#applyoptions)

***

### bind() \{#bind}

```ts
protected bind(service): void;
```

定義: [src/service/ServiceStore.ts:41](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/service/ServiceStore.ts#L41)

ロード済みコンポーネントをランタイムへ配線します(例: リスナーの
イベント購読)。`onLoad` の後、ストアに追加された状態で呼ばれます。

#### パラメータ

##### service

[`Service`](Service.md)

#### 戻り値

`void`

#### 上書き

[`ComponentStore`](ComponentStore.md).[`bind`](ComponentStore.md#bind)

***

### deriveName() \{#derivename}

```ts
protected deriveName(className): string;
```

定義: [src/service/ServiceStore.ts:32](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/service/ServiceStore.ts#L32)

サービス名は lowerCamelCase で導出します
(`GuildSettingsService` → `guildSettings`)。
オブジェクトのプロパティとして自然に参照できる形にするためです。

#### パラメータ

##### className

`string`

#### 戻り値

`string`

#### 上書き

[`ComponentStore`](ComponentStore.md).[`deriveName`](ComponentStore.md#derivename)

***

### load() \{#load}

```ts
load(cls, location?): Promise<Service>;
```

定義: [src/component/ComponentStore.ts:122](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L122)

単一のコンポーネントクラスを構築・初期化・追加します。
同じクラスの二重ロードは既存インスタンスを返すだけで無害です。
**別の** クラスが既存の名前に解決された場合は
[ComponentLoadError](ComponentLoadError.md) を投げます。

#### パラメータ

##### cls

[`ComponentClass`](../type-aliases/ComponentClass.md)\<[`Service`](Service.md)\>

##### location?

`string` \| `null`

#### 戻り値

`Promise`\<[`Service`](Service.md)\>

#### 継承元

[`ComponentStore`](ComponentStore.md).[`load`](ComponentStore.md#load)

***

### loadAll() \{#loadall}

```ts
loadAll(baseDirectory): Promise<void>;
```

定義: [src/component/ComponentStore.ts:95](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L95)

この種別のすべてのコンポーネントをロードします: 先に明示登録分、
次に `<baseDirectory>/<name>` のファイル自動探索(baseDirectory 設定時)。
クライアント起動時にレジストリから呼ばれます。

#### パラメータ

##### baseDirectory

`string` \| `null`

#### 戻り値

`Promise`\<`void`\>

#### 継承元

[`ComponentStore`](ComponentStore.md).[`loadAll`](ComponentStore.md#loadall)

***

### register() \{#register}

```ts
register(...classes): this;
```

定義: [src/component/ComponentStore.ts:77](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L77)

コンポーネントクラスを明示登録します(ファイル自動探索の代替)。
[ComponentStore.loadAll](ComponentStore.md#loadall) 前ならキューに積まれ、後なら即座に
ロードされます(fire-and-forget — インスタンスを待つ場合は
[ComponentStore.load](ComponentStore.md#load) を使ってください)。

#### パラメータ

##### classes

...[`ComponentClass`](../type-aliases/ComponentClass.md)\<[`Service`](Service.md)\>[]

#### 戻り値

`this`

#### 継承元

[`ComponentStore`](ComponentStore.md).[`register`](ComponentStore.md#register)

***

### unbind() \{#unbind}

```ts
protected unbind(service): void;
```

定義: [src/service/ServiceStore.ts:45](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/service/ServiceStore.ts#L45)

[ComponentStore.bind](ComponentStore.md#bind) の逆操作。アンロード時に呼ばれます。

#### パラメータ

##### service

[`Service`](Service.md)

#### 戻り値

`void`

#### 上書き

[`ComponentStore`](ComponentStore.md).[`unbind`](ComponentStore.md#unbind)

***

### unload() \{#unload}

```ts
unload(resolvable): Promise<Service>;
```

定義: [src/component/ComponentStore.ts:200](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L200)

コンポーネントを取り除きます([ComponentStore.unbind](ComponentStore.md#unbind) と `onUnload` を実行)。

#### パラメータ

##### resolvable

`string` \| [`Service`](Service.md)

#### 戻り値

`Promise`\<[`Service`](Service.md)\>

#### 継承元

[`ComponentStore`](ComponentStore.md).[`unload`](ComponentStore.md#unload)

***

### unloadAll() \{#unloadall}

```ts
unloadAll(): Promise<void>;
```

定義: [src/component/ComponentStore.ts:217](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L217)

このストアのすべてのコンポーネントをアンロードします(クライアント終了時に使用)。

#### 戻り値

`Promise`\<`void`\>

#### 継承元

[`ComponentStore`](ComponentStore.md).[`unloadAll`](ComponentStore.md#unloadall)
