# 抽象 クラス: Task

定義: [plugins/utils/src/scheduler.ts:50](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/scheduler.ts#L50)

定期実行されるバックグラウンドジョブ。

```ts
// tasks/CleanupTask.ts — 置くだけで動く
import { Task } from "@cc-discord-framework/utils";

@Task.define({ every: "1h", runOnStart: true })
export class CleanupTask extends Task {
  override async run() {
    this.logger.info("クリーンアップを実行します");
  }
}
```

## 拡張

- [`Component`](../../core/classes/Component.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new Task(): Task;
```

#### 戻り値

`Task`

#### 継承元

[`Component`](../../core/classes/Component.md).[`constructor`](../../core/classes/Component.md#constructor)

## プロパティ

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/Component.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L30)

フレームワーク共有サービスを持つコンテナ。

#### 継承元

[`Component`](../../core/classes/Component.md).[`container`](../../core/classes/Component.md#container)

***

### every \{#every}

```ts
readonly every: number;
```

定義: [plugins/utils/src/scheduler.ts:52](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/scheduler.ts#L52)

解決済みの実行間隔(ミリ秒)。

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: [src/component/Component.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L39)

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

#### 継承元

[`Component`](../../core/classes/Component.md).[`location`](../../core/classes/Component.md#location)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/Component.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L36)

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

#### 継承元

[`Component`](../../core/classes/Component.md).[`logger`](../../core/classes/Component.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/Component.ts:27](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L27)

ストア内で一意なコンポーネント名。

#### 継承元

[`Component`](../../core/classes/Component.md).[`name`](../../core/classes/Component.md#name)

***

### overlap \{#overlap}

```ts
readonly overlap: boolean;
```

定義: [plugins/utils/src/scheduler.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/scheduler.ts#L55)

前回の run() の実行中に次の周期を重ねるか。

***

### runOnStart \{#runonstart}

```ts
readonly runOnStart: boolean;
```

定義: [plugins/utils/src/scheduler.ts:53](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/scheduler.ts#L53)

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: [src/component/Component.ts:33](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L33)

このコンポーネントが属するストア。

#### 継承元

[`Component`](../../core/classes/Component.md).[`store`](../../core/classes/Component.md#store)

## アクセッサー

### client \{#client}

#### 署名を取得する

```ts
get client(): Client;
```

定義: [src/component/Component.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L42)

フレームワーククライアント。

##### 戻り値

[`Client`](../../core/classes/Client.md)

#### 継承元

[`Component`](../../core/classes/Component.md).[`client`](../../core/classes/Component.md#client)

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

[`Services`](../../core/interfaces/Services.md)

#### 継承元

[`Component`](../../core/classes/Component.md).[`services`](../../core/classes/Component.md#services)

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

[`Component`](../../core/classes/Component.md).[`onLoad`](../../core/classes/Component.md#onload)

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

[`Component`](../../core/classes/Component.md).[`onUnload`](../../core/classes/Component.md#onunload)

***

### run() \{#run}

```ts
abstract run(): unknown;
```

定義: [plugins/utils/src/scheduler.ts:62](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/scheduler.ts#L62)

#### 戻り値

`unknown`

***

### define() \{#define}

```ts
static define(options): (_target, context) => void;
```

定義: [plugins/utils/src/scheduler.ts:58](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/scheduler.ts#L58)

タスクのメタデータを宣言します。`every` は必須です。

#### パラメータ

##### options

[`TaskOptions`](../interfaces/TaskOptions.md)

#### 戻り値

(`_target`, `context`) => `void`
