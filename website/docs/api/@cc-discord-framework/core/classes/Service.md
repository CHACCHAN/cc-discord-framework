# 抽象 クラス: Service

定義: [src/service/Service.ts:45](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/service/Service.ts#L45)

アプリケーション横断のロジック・状態を担うコンポーネント(データベース、
設定、外部API クライアントなど)。

`services/` ディレクトリに置くだけで自動ロードされ、あらゆるコンポーネント
から **import なしで** `this.services.<名前>` として参照できます。
名前はクラス名から導出されます(`ConfigService` → `config`、
`GuildSettingsService` → `guildSettings`)。

```ts
@Service.define()
export class ConfigService extends Service {
  readonly ownerIds = (Bun.env.OWNER_IDS ?? "").split(",");
}

// 別のコンポーネントから — import 不要:
this.services.config.ownerIds;
```

初期化・後始末はライフサイクルで行います: 接続を開くのは `onLoad`、
閉じるのは `onUnload`(`client.destroy()` で呼ばれます)。

## 拡張

- [`Component`](Component.md)

## によって拡張された

- [`UiService`](../../utils/classes/UiService.md)
- [`AudioService`](../../music/classes/AudioService.md)
- [`AiService`](../../ai/classes/AiService.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new Service(): Service;
```

#### 戻り値

`Service`

#### 継承元

[`Component`](Component.md).[`constructor`](Component.md#constructor)

## プロパティ

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/Component.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L30)

フレームワーク共有サービスを持つコンテナ。

#### 継承元

[`Component`](Component.md).[`container`](Component.md#container)

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: [src/component/Component.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L39)

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

#### 継承元

[`Component`](Component.md).[`location`](Component.md#location)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/Component.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L36)

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

#### 継承元

[`Component`](Component.md).[`logger`](Component.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/Component.ts:27](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L27)

ストア内で一意なコンポーネント名。

#### 継承元

[`Component`](Component.md).[`name`](Component.md#name)

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: [src/component/Component.ts:33](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L33)

このコンポーネントが属するストア。

#### 継承元

[`Component`](Component.md).[`store`](Component.md#store)

## アクセッサー

### client \{#client}

#### 署名を取得する

```ts
get client(): Client;
```

定義: [src/component/Component.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L42)

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

定義: [src/component/Component.ts:50](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L50)

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

定義: [src/component/Component.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L55)

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

定義: [src/component/Component.ts:58](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L58)

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

定義: [src/service/Service.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/service/Service.ts#L47)

サービスのメタデータを宣言します。省略可能です。

#### パラメータ

##### options?

[`ServiceOptions`](../interfaces/ServiceOptions.md) = `{}`

#### 戻り値

(`_target`, `context`) => `void`
