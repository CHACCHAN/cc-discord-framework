# クラス: AiToolStore

定義: plugins/ai/src/AiTool.ts:107

[AiTool](AiTool.md) のストア。`ai/` を走査します。

## 拡張

- [`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md)\<[`AiTool`](AiTool.md)\>

## コンストラクター

### コンストラクター \{#constructor}

```ts
new AiToolStore(): AiToolStore;
```

定義: plugins/ai/src/AiTool.ts:108

#### 戻り値

`AiToolStore`

#### 上書き

[`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md).[`constructor`](../../../cc-discord-framework/classes/ComponentStore.md#constructor)

## プロパティ

### base \{#base}

```ts
readonly base: AbstractComponentClass<AiTool<unknown>>;
```

定義: src/component/ComponentStore.ts:50

この種別のコンポーネントが継承する基底クラス。

#### 継承元

[`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md).[`base`](../../../cc-discord-framework/classes/ComponentStore.md#base)

***

### container \{#container}

```ts
readonly container: Container;
```

定義: src/component/ComponentStore.ts:56

コンテナ。レジストリへの登録時に割り当てられます。

#### 継承元

[`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md).[`container`](../../../cc-discord-framework/classes/ComponentStore.md#container)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: src/component/ComponentStore.ts:59

このストア用の子ロガー。登録時に割り当てられます。

#### 継承元

[`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md).[`logger`](../../../cc-discord-framework/classes/ComponentStore.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: src/component/ComponentStore.ts:47

ストア名(= 自動探索ディレクトリ名)。

#### 継承元

[`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md).[`name`](../../../cc-discord-framework/classes/ComponentStore.md#name)

***

### suffix \{#suffix}

```ts
readonly suffix: string;
```

定義: src/component/ComponentStore.ts:53

クラス名から取り除く接尾辞([ComponentStoreOptions.suffix](../../../cc-discord-framework/interfaces/ComponentStoreOptions.md#suffix))。

#### 継承元

[`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md).[`suffix`](../../../cc-discord-framework/classes/ComponentStore.md#suffix)

## メソッド

### applyOptions() \{#applyoptions}

```ts
protected applyOptions(component, options): void;
```

定義: plugins/ai/src/AiTool.ts:114

解決済みメタデータをインスタンスへ適用します — 種別固有フィールドの
割り当てと必須項目の検証はここで行います。ロード時に弾く場合は
([ComponentLoadError](../../../cc-discord-framework/classes/ComponentLoadError.md) を推奨)例外を投げてください。

#### パラメータ

##### component

[`AiTool`](AiTool.md)

##### options

`Partial`\<[`AiToolOptions`](../interfaces/AiToolOptions.md)\>

#### 戻り値

`void`

#### 上書き

[`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md).[`applyOptions`](../../../cc-discord-framework/classes/ComponentStore.md#applyoptions)

***

### available() \{#available}

```ts
available(context): AiTool<unknown>[];
```

定義: plugins/ai/src/AiTool.ts:138

そのコンテキストで使えるツール(名前順)。

#### パラメータ

##### context

[`AiToolContext`](../interfaces/AiToolContext.md)

#### 戻り値

[`AiTool`](AiTool.md)\<`unknown`\>[]

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

[`AiTool`](AiTool.md)

#### 戻り値

`void`

#### 継承元

[`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md).[`bind`](../../../cc-discord-framework/classes/ComponentStore.md#bind)

***

### deriveName() \{#derivename}

```ts
protected deriveName(className): string;
```

定義: src/component/ComponentStore.ts:229

クラス名からコンポーネント名を導出します: 種別サフィックス
([ComponentStore.suffix](../../../cc-discord-framework/classes/ComponentStore.md#suffix))を取り除き、ケバブケース化します
(`UserInfoCommand` → `user-info`)。
カスタム種別で慣例を変えたい場合はオーバーライドしてください。

#### パラメータ

##### className

`string`

#### 戻り値

`string`

#### 継承元

[`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md).[`deriveName`](../../../cc-discord-framework/classes/ComponentStore.md#derivename)

***

### load() \{#load}

```ts
load(cls, location?): Promise<AiTool<unknown>>;
```

定義: src/component/ComponentStore.ts:122

単一のコンポーネントクラスを構築・初期化・追加します。
同じクラスの二重ロードは既存インスタンスを返すだけで無害です。
**別の** クラスが既存の名前に解決された場合は
[ComponentLoadError](../../../cc-discord-framework/classes/ComponentLoadError.md) を投げます。

#### パラメータ

##### cls

[`ComponentClass`](../../../cc-discord-framework/type-aliases/ComponentClass.md)\<[`AiTool`](AiTool.md)\<`unknown`\>\>

##### location?

`string` \| `null`

#### 戻り値

`Promise`\<[`AiTool`](AiTool.md)\<`unknown`\>\>

#### 継承元

[`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md).[`load`](../../../cc-discord-framework/classes/ComponentStore.md#load)

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

[`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md).[`loadAll`](../../../cc-discord-framework/classes/ComponentStore.md#loadall)

***

### register() \{#register}

```ts
register(...classes): this;
```

定義: src/component/ComponentStore.ts:77

コンポーネントクラスを明示登録します(ファイル自動探索の代替)。
[ComponentStore.loadAll](../../../cc-discord-framework/classes/ComponentStore.md#loadall) 前ならキューに積まれ、後なら即座に
ロードされます(fire-and-forget — インスタンスを待つ場合は
[ComponentStore.load](../../../cc-discord-framework/classes/ComponentStore.md#load) を使ってください)。

#### パラメータ

##### classes

...[`ComponentClass`](../../../cc-discord-framework/type-aliases/ComponentClass.md)\<[`AiTool`](AiTool.md)\<`unknown`\>\>[]

#### 戻り値

`this`

#### 継承元

[`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md).[`register`](../../../cc-discord-framework/classes/ComponentStore.md#register)

***

### toToolSet() \{#totoolset}

```ts
toToolSet(context, timeout?): ToolSet;
```

定義: plugins/ai/src/AiTool.ts:155

登録済みのツールを AI SDK の [ToolSet](https://ai-sdk.dev/docs/reference/ai-sdk-core) へ変換します。

`execute` の失敗は握りつぶさず、ログと `aiError` を出したうえで
**エラー内容をモデルへ返します** — ツール1つが落ちても会話全体が
死なないようにするためです。

#### パラメータ

##### context

[`AiToolContext`](../interfaces/AiToolContext.md)

ツールへ渡すコンテキスト。

##### timeout?

`number` \| `false`

1回の実行を打ち切るまでのミリ秒。`false` で無制限。

#### 戻り値

[`ToolSet`](https://ai-sdk.dev/docs/reference/ai-sdk-core)

***

### unbind() \{#unbind}

```ts
protected unbind(component): void;
```

定義: src/component/ComponentStore.ts:252

[ComponentStore.bind](../../../cc-discord-framework/classes/ComponentStore.md#bind) の逆操作。アンロード時に呼ばれます。

#### パラメータ

##### component

[`AiTool`](AiTool.md)

#### 戻り値

`void`

#### 継承元

[`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md).[`unbind`](../../../cc-discord-framework/classes/ComponentStore.md#unbind)

***

### unload() \{#unload}

```ts
unload(resolvable): Promise<AiTool<unknown>>;
```

定義: src/component/ComponentStore.ts:200

コンポーネントを取り除きます([ComponentStore.unbind](../../../cc-discord-framework/classes/ComponentStore.md#unbind) と `onUnload` を実行)。

#### パラメータ

##### resolvable

`string` \| [`AiTool`](AiTool.md)\<`unknown`\>

#### 戻り値

`Promise`\<[`AiTool`](AiTool.md)\<`unknown`\>\>

#### 継承元

[`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md).[`unload`](../../../cc-discord-framework/classes/ComponentStore.md#unload)

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

[`ComponentStore`](../../../cc-discord-framework/classes/ComponentStore.md).[`unloadAll`](../../../cc-discord-framework/classes/ComponentStore.md#unloadall)
