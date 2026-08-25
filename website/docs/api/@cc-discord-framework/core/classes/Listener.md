# 抽象 クラス: Listener\<E\>

定義: [src/listener/Listener.ts:34](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/listener/Listener.ts#L34)

1つのクライアントイベントを購読するリスナー。イベントはデコレータで
宣言し、ジェネリクスにも同じものを指定します — ジェネリクスが `run` の
引数を型付けし、両者の不一致はコンパイルエラーになります。

```ts
@Listener.define({ event: Events.MessageCreate })
export class MessageLogListener extends Listener<Events.MessageCreate> {
  override run(message: Message) {
    this.logger.info({ author: message.author.tag }, "メッセージを受信しました");
  }
}
```

## 拡張

- [`Component`](Component.md)

## 型パラメーター

### E

`E` *extends* [`ListenerEvent`](../type-aliases/ListenerEvent.md) = [`ListenerEvent`](../type-aliases/ListenerEvent.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new Listener<E>(): Listener<E>;
```

#### 戻り値

`Listener`\<`E`\>

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

### event \{#event}

```ts
readonly event: E;
```

定義: [src/listener/Listener.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/listener/Listener.ts#L36)

このリスナーが購読するイベント。

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

### once \{#once}

```ts
readonly once: boolean;
```

定義: [src/listener/Listener.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/listener/Listener.ts#L39)

最初の1回で購読解除するかどうか。

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

### run() \{#run}

```ts
abstract run(...args): unknown;
```

定義: [src/listener/Listener.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/listener/Listener.ts#L47)

イベント1回分の処理。

#### パラメータ

##### args

...[`ClientEvents`](../interfaces/ClientEvents.md)\[`E`\]

#### 戻り値

`unknown`

***

### define() \{#define}

```ts
static define<E>(options): (_target, context) => void;
```

定義: [src/listener/Listener.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/listener/Listener.ts#L42)

リスナーのメタデータを宣言します。必須です — リスナーにはイベントが必要です。

#### 型パラメーター

##### E

`E` *extends* keyof [`ClientEvents`](../interfaces/ClientEvents.md)

#### パラメータ

##### options

[`ListenerOptions`](../interfaces/ListenerOptions.md)\<`E`\>

#### 戻り値

(`_target`, `context`) => `void`
