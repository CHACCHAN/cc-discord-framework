# クラス: TaskStore

定義: [plugins/utils/src/scheduler.ts:69](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/scheduler.ts#L69)

[Task](Task.md) コンポーネントのストア。`tasks/` を走査し、稼働中はスケジュールを管理します。

## 拡張

- [`ComponentStore`](../../core/classes/ComponentStore.md)\<[`Task`](Task.md)\>

## コンストラクター

### コンストラクター \{#constructor}

```ts
new TaskStore(): TaskStore;
```

定義: [plugins/utils/src/scheduler.ts:74](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/scheduler.ts#L74)

#### 戻り値

`TaskStore`

#### 上書き

[`ComponentStore`](../../core/classes/ComponentStore.md).[`constructor`](../../core/classes/ComponentStore.md#constructor)

## プロパティ

### base \{#base}

```ts
readonly base: AbstractComponentClass<Task>;
```

定義: [src/component/ComponentStore.ts:50](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L50)

この種別のコンポーネントが継承する基底クラス。

#### 継承元

[`ComponentStore`](../../core/classes/ComponentStore.md).[`base`](../../core/classes/ComponentStore.md#base)

***

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/ComponentStore.ts:56](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L56)

コンテナ。レジストリへの登録時に割り当てられます。

#### 継承元

[`ComponentStore`](../../core/classes/ComponentStore.md).[`container`](../../core/classes/ComponentStore.md#container)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/ComponentStore.ts:59](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L59)

このストア用の子ロガー。登録時に割り当てられます。

#### 継承元

[`ComponentStore`](../../core/classes/ComponentStore.md).[`logger`](../../core/classes/ComponentStore.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/ComponentStore.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L47)

ストア名(= 自動探索ディレクトリ名)。

#### 継承元

[`ComponentStore`](../../core/classes/ComponentStore.md).[`name`](../../core/classes/ComponentStore.md#name)

***

### suffix \{#suffix}

```ts
readonly suffix: string;
```

定義: [src/component/ComponentStore.ts:53](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L53)

クラス名から取り除く接尾辞([ComponentStoreOptions.suffix](../../core/interfaces/ComponentStoreOptions.md#suffix))。

#### 継承元

[`ComponentStore`](../../core/classes/ComponentStore.md).[`suffix`](../../core/classes/ComponentStore.md#suffix)

## メソッド

### applyOptions() \{#applyoptions}

```ts
protected applyOptions(task, options): void;
```

定義: [plugins/utils/src/scheduler.ts:78](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/scheduler.ts#L78)

解決済みメタデータをインスタンスへ適用します — 種別固有フィールドの
割り当てと必須項目の検証はここで行います。ロード時に弾く場合は
([ComponentLoadError](../../core/classes/ComponentLoadError.md) を推奨)例外を投げてください。

#### パラメータ

##### task

[`Task`](Task.md)

##### options

[`TaskOptions`](../interfaces/TaskOptions.md)

#### 戻り値

`void`

#### 上書き

[`ComponentStore`](../../core/classes/ComponentStore.md).[`applyOptions`](../../core/classes/ComponentStore.md#applyoptions)

***

### bind() \{#bind}

```ts
protected bind(task): void;
```

定義: [plugins/utils/src/scheduler.ts:106](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/scheduler.ts#L106)

ロード済みコンポーネントをランタイムへ配線します(例: リスナーの
イベント購読)。`onLoad` の後、ストアに追加された状態で呼ばれます。

#### パラメータ

##### task

[`Task`](Task.md)

#### 戻り値

`void`

#### 上書き

[`ComponentStore`](../../core/classes/ComponentStore.md).[`bind`](../../core/classes/ComponentStore.md#bind)

***

### deriveName() \{#derivename}

```ts
protected deriveName(className): string;
```

定義: [src/component/ComponentStore.ts:229](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L229)

クラス名からコンポーネント名を導出します: 種別サフィックス
([ComponentStore.suffix](../../core/classes/ComponentStore.md#suffix))を取り除き、ケバブケース化します
(`UserInfoCommand` → `user-info`)。
カスタム種別で慣例を変えたい場合はオーバーライドしてください。

#### パラメータ

##### className

`string`

#### 戻り値

`string`

#### 継承元

[`ComponentStore`](../../core/classes/ComponentStore.md).[`deriveName`](../../core/classes/ComponentStore.md#derivename)

***

### load() \{#load}

```ts
load(cls, location?): Promise<Task>;
```

定義: [src/component/ComponentStore.ts:122](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L122)

単一のコンポーネントクラスを構築・初期化・追加します。
同じクラスの二重ロードは既存インスタンスを返すだけで無害です。
**別の** クラスが既存の名前に解決された場合は
[ComponentLoadError](../../core/classes/ComponentLoadError.md) を投げます。

#### パラメータ

##### cls

[`ComponentClass`](../../core/type-aliases/ComponentClass.md)\<[`Task`](Task.md)\>

##### location?

`string` \| `null`

#### 戻り値

`Promise`\<[`Task`](Task.md)\>

#### 継承元

[`ComponentStore`](../../core/classes/ComponentStore.md).[`load`](../../core/classes/ComponentStore.md#load)

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

#### 継承元

[`ComponentStore`](../../core/classes/ComponentStore.md).[`loadAll`](../../core/classes/ComponentStore.md#loadall)

***

### register() \{#register}

```ts
register(...classes): this;
```

定義: [src/component/ComponentStore.ts:77](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L77)

コンポーネントクラスを明示登録します(ファイル自動探索の代替)。
[ComponentStore.loadAll](../../core/classes/ComponentStore.md#loadall) 前ならキューに積まれ、後なら即座に
ロードされます(fire-and-forget — インスタンスを待つ場合は
[ComponentStore.load](../../core/classes/ComponentStore.md#load) を使ってください)。

#### パラメータ

##### classes

...[`ComponentClass`](../../core/type-aliases/ComponentClass.md)\<[`Task`](Task.md)\>[]

#### 戻り値

`this`

#### 継承元

[`ComponentStore`](../../core/classes/ComponentStore.md).[`register`](../../core/classes/ComponentStore.md#register)

***

### unbind() \{#unbind}

```ts
protected unbind(task): void;
```

定義: [plugins/utils/src/scheduler.ts:112](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/scheduler.ts#L112)

[ComponentStore.bind](../../core/classes/ComponentStore.md#bind) の逆操作。アンロード時に呼ばれます。

#### パラメータ

##### task

[`Task`](Task.md)

#### 戻り値

`void`

#### 上書き

[`ComponentStore`](../../core/classes/ComponentStore.md).[`unbind`](../../core/classes/ComponentStore.md#unbind)

***

### unload() \{#unload}

```ts
unload(resolvable): Promise<Task>;
```

定義: [src/component/ComponentStore.ts:200](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L200)

コンポーネントを取り除きます([ComponentStore.unbind](../../core/classes/ComponentStore.md#unbind) と `onUnload` を実行)。

#### パラメータ

##### resolvable

`string` \| [`Task`](Task.md)

#### 戻り値

`Promise`\<[`Task`](Task.md)\>

#### 継承元

[`ComponentStore`](../../core/classes/ComponentStore.md).[`unload`](../../core/classes/ComponentStore.md#unload)

***

### unloadAll() \{#unloadall}

```ts
unloadAll(): Promise<void>;
```

定義: [src/component/ComponentStore.ts:217](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L217)

このストアのすべてのコンポーネントをアンロードします(クライアント終了時に使用)。

#### 戻り値

`Promise`\<`void`\>

#### 継承元

[`ComponentStore`](../../core/classes/ComponentStore.md).[`unloadAll`](../../core/classes/ComponentStore.md#unloadall)
