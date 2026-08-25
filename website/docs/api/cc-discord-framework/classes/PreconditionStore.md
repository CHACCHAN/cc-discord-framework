# クラス: PreconditionStore

定義: src/precondition/PreconditionStore.ts:7

[Precondition](Precondition.md) コンポーネントのストア。`preconditions/` を走査します。

## 拡張

- [`ComponentStore`](ComponentStore.md)\<[`Precondition`](Precondition.md)\>

## コンストラクター

### コンストラクター \{#constructor}

```ts
new PreconditionStore(): PreconditionStore;
```

定義: src/precondition/PreconditionStore.ts:8

#### 戻り値

`PreconditionStore`

#### 上書き

[`ComponentStore`](ComponentStore.md).[`constructor`](ComponentStore.md#constructor)

## プロパティ

### base \{#base}

```ts
readonly base: AbstractComponentClass<Precondition>;
```

定義: src/component/ComponentStore.ts:50

この種別のコンポーネントが継承する基底クラス。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`base`](ComponentStore.md#base)

***

### container \{#container}

```ts
readonly container: Container;
```

定義: src/component/ComponentStore.ts:56

コンテナ。レジストリへの登録時に割り当てられます。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`container`](ComponentStore.md#container)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: src/component/ComponentStore.ts:59

このストア用の子ロガー。登録時に割り当てられます。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`logger`](ComponentStore.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: src/component/ComponentStore.ts:47

ストア名(= 自動探索ディレクトリ名)。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`name`](ComponentStore.md#name)

***

### suffix \{#suffix}

```ts
readonly suffix: string;
```

定義: src/component/ComponentStore.ts:53

クラス名から取り除く接尾辞([ComponentStoreOptions.suffix](../interfaces/ComponentStoreOptions.md#suffix))。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`suffix`](ComponentStore.md#suffix)

## メソッド

### applyOptions() \{#applyoptions}

```ts
protected applyOptions(component, options): void;
```

定義: src/component/ComponentStore.ts:238

解決済みメタデータをインスタンスへ適用します — 種別固有フィールドの
割り当てと必須項目の検証はここで行います。ロード時に弾く場合は
([ComponentLoadError](ComponentLoadError.md) を推奨)例外を投げてください。

#### パラメータ

##### component

[`Precondition`](Precondition.md)

##### options

[`ComponentOptions`](../interfaces/ComponentOptions.md)

#### 戻り値

`void`

#### 継承元

[`ComponentStore`](ComponentStore.md).[`applyOptions`](ComponentStore.md#applyoptions)

***

### bind() \{#bind}

```ts
protected bind(component): void;
```

定義: src/component/ComponentStore.ts:247

ロード済みコンポーネントをランタイムへ配線します(例: リスナーの
イベント購読)。`onLoad` の後、ストアに追加された状態で呼ばれます。

#### パラメータ

##### component

[`Precondition`](Precondition.md)

#### 戻り値

`void`

#### 継承元

[`ComponentStore`](ComponentStore.md).[`bind`](ComponentStore.md#bind)

***

### deriveName() \{#derivename}

```ts
protected deriveName(className): string;
```

定義: src/precondition/PreconditionStore.ts:17

Precondition 名は [Preconditions](../interfaces/Preconditions.md) インターフェースのキーと
一致させるため、大文字小文字を保持します
(`OwnerOnlyPrecondition` → `OwnerOnly`)。

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
load(cls, location?): Promise<Precondition>;
```

定義: src/component/ComponentStore.ts:122

単一のコンポーネントクラスを構築・初期化・追加します。
同じクラスの二重ロードは既存インスタンスを返すだけで無害です。
**別の** クラスが既存の名前に解決された場合は
[ComponentLoadError](ComponentLoadError.md) を投げます。

#### パラメータ

##### cls

[`ComponentClass`](../type-aliases/ComponentClass.md)\<[`Precondition`](Precondition.md)\>

##### location?

`string` \| `null`

#### 戻り値

`Promise`\<[`Precondition`](Precondition.md)\>

#### 継承元

[`ComponentStore`](ComponentStore.md).[`load`](ComponentStore.md#load)

***

### loadAll() \{#loadall}

```ts
loadAll(baseDirectory): Promise<void>;
```

定義: src/component/ComponentStore.ts:95

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

定義: src/component/ComponentStore.ts:77

コンポーネントクラスを明示登録します(ファイル自動探索の代替)。
[ComponentStore.loadAll](ComponentStore.md#loadall) 前ならキューに積まれ、後なら即座に
ロードされます(fire-and-forget — インスタンスを待つ場合は
[ComponentStore.load](ComponentStore.md#load) を使ってください)。

#### パラメータ

##### classes

...[`ComponentClass`](../type-aliases/ComponentClass.md)\<[`Precondition`](Precondition.md)\>[]

#### 戻り値

`this`

#### 継承元

[`ComponentStore`](ComponentStore.md).[`register`](ComponentStore.md#register)

***

### run() \{#run}

```ts
run(names, payload): Promise<PreconditionResult>;
```

定義: src/precondition/PreconditionStore.ts:31

コマンド呼び出しに対して指定された Precondition を順番に実行し、
最初の拒否で停止します。

#### パラメータ

##### names

readonly `string`[]

##### payload

[`CommandRunPayload`](../type-aliases/CommandRunPayload.md) & `object`

#### 戻り値

`Promise`\<[`PreconditionResult`](../type-aliases/PreconditionResult.md)\>

#### Throws

FrameworkError 呼び出されたフローを Precondition が実装して
いない場合。設定ミスは黙って通過させず、明示的に失敗させます。

***

### unbind() \{#unbind}

```ts
protected unbind(component): void;
```

定義: src/component/ComponentStore.ts:252

[ComponentStore.bind](ComponentStore.md#bind) の逆操作。アンロード時に呼ばれます。

#### パラメータ

##### component

[`Precondition`](Precondition.md)

#### 戻り値

`void`

#### 継承元

[`ComponentStore`](ComponentStore.md).[`unbind`](ComponentStore.md#unbind)

***

### unload() \{#unload}

```ts
unload(resolvable): Promise<Precondition>;
```

定義: src/component/ComponentStore.ts:200

コンポーネントを取り除きます([ComponentStore.unbind](ComponentStore.md#unbind) と `onUnload` を実行)。

#### パラメータ

##### resolvable

`string` \| [`Precondition`](Precondition.md)

#### 戻り値

`Promise`\<[`Precondition`](Precondition.md)\>

#### 継承元

[`ComponentStore`](ComponentStore.md).[`unload`](ComponentStore.md#unload)

***

### unloadAll() \{#unloadall}

```ts
unloadAll(): Promise<void>;
```

定義: src/component/ComponentStore.ts:217

このストアのすべてのコンポーネントをアンロードします(クライアント終了時に使用)。

#### 戻り値

`Promise`\<`void`\>

#### 継承元

[`ComponentStore`](ComponentStore.md).[`unloadAll`](ComponentStore.md#unloadall)
