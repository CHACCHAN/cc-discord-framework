# 抽象 クラス: Precondition

定義: [src/precondition/Precondition.ts:56](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/precondition/Precondition.ts#L56)

コマンド実行前に走る再利用可能なガード。

サポートするコマンドフローごとに判定を実装します。コマンドが使用する
フローは、そのコマンドに付いた **すべての** Precondition が実装している
必要があります — 未実装は黙って通過せず、明示的に失敗します。

```ts
@Precondition.define()
export class OwnerOnlyPrecondition extends Precondition {
  override chatInputRun(interaction: ChatInputCommandInteraction) {
    return interaction.user.id === OWNER_ID
      ? this.ok()
      : this.deny("このコマンドはBotのオーナーのみ使用できます。");
  }
}
```

Precondition 名はクラス名から `Precondition` サフィックスを除いた形が
既定です(`OwnerOnlyPrecondition` → `OwnerOnly`)。

## 拡張

- [`Component`](Component.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new Precondition(): Precondition;
```

#### 戻り値

`Precondition`

#### 継承元

[`Component`](Component.md).[`constructor`](Component.md#constructor)

## プロパティ

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/Component.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L30)

フレームワーク共有サービスを持つコンテナ。

#### 継承元

[`Component`](Component.md).[`container`](Component.md#container)

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: [src/component/Component.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L39)

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

#### 継承元

[`Component`](Component.md).[`location`](Component.md#location)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/Component.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L36)

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

#### 継承元

[`Component`](Component.md).[`logger`](Component.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/Component.ts:27](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L27)

ストア内で一意なコンポーネント名。

#### 継承元

[`Component`](Component.md).[`name`](Component.md#name)

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: [src/component/Component.ts:33](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L33)

このコンポーネントが属するストア。

#### 継承元

[`Component`](Component.md).[`store`](Component.md#store)

## アクセッサー

### client \{#client}

#### 署名を取得する

```ts
get client(): Client;
```

定義: [src/component/Component.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L42)

フレームワーククライアント。

##### 戻り値

[`Client`](Client.md)

#### 継承元

[`Component`](Component.md).[`client`](Component.md#client)

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

[`Services`](../interfaces/Services.md)

#### 継承元

[`Component`](Component.md).[`services`](Component.md#services)

## メソッド

### chatInputRun()? \{#chatinputrun}

```ts
optional chatInputRun(interaction, command): Awaitable<PreconditionResult>;
```

定義: [src/precondition/Precondition.ts:63](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/precondition/Precondition.ts#L63)

スラッシュコマンド呼び出しに対する判定。

#### パラメータ

##### interaction

`ChatInputCommandInteraction`

##### command

[`Command`](Command.md)

#### 戻り値

`Awaitable`\<[`PreconditionResult`](../type-aliases/PreconditionResult.md)\>

***

### deny() \{#deny}

```ts
protected deny(reason, options?): PreconditionResult;
```

定義: [src/precondition/Precondition.ts:77](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/precondition/Precondition.ts#L77)

ユーザー向けの理由付きの拒否。

#### パラメータ

##### reason

`string`

##### options?

###### context?

`unknown`

#### 戻り値

[`PreconditionResult`](../type-aliases/PreconditionResult.md)

***

### messageRun()? \{#messagerun}

```ts
optional messageRun(message, command): Awaitable<PreconditionResult>;
```

定義: [src/precondition/Precondition.ts:69](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/precondition/Precondition.ts#L69)

プレフィックス(メッセージ)コマンド呼び出しに対する判定。

#### パラメータ

##### message

`Message`

##### command

[`Command`](Command.md)

#### 戻り値

`Awaitable`\<[`PreconditionResult`](../type-aliases/PreconditionResult.md)\>

***

### ok() \{#ok}

```ts
protected ok(): PreconditionResult;
```

定義: [src/precondition/Precondition.ts:72](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/precondition/Precondition.ts#L72)

通過を表す結果。

#### 戻り値

[`PreconditionResult`](../type-aliases/PreconditionResult.md)

***

### onLoad()? \{#onload}

```ts
optional onLoad(): unknown;
```

定義: [src/component/Component.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L55)

初期化後・ストア追加前に呼ばれます。

#### 戻り値

`unknown`

#### 継承元

[`Component`](Component.md).[`onLoad`](Component.md#onload)

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

[`Component`](Component.md).[`onUnload`](Component.md#onunload)

***

### define() \{#define}

```ts
static define(options?): (_target, context) => void;
```

定義: [src/precondition/Precondition.ts:58](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/precondition/Precondition.ts#L58)

Precondition のメタデータを宣言します。省略可能です(名前は導出されます)。

#### パラメータ

##### options?

[`PreconditionOptions`](../interfaces/PreconditionOptions.md) = `{}`

#### 戻り値

(`_target`, `context`) => `void`
