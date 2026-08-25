# クラス: Container

定義: [src/container.ts:31](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/container.ts#L31)

フレームワーク全体で共有されるサービス群。すべてのコンポーネントから
`this.container`、クライアントからは `client.container` で参照できます。

コンテナは **クライアント毎** のインスタンスです(グローバルシングルトン
ではありません)。テストや複数クライアント構成でも状態が混ざりません。

アプリケーション固有の共有ロジックは、原則として
[サービスコンポーネント](../interfaces/Services.md)(`services/` ディレクトリ)で
定義してください。コンテナへ直接プロパティを生やしたい場合は、
宣言マージ + 代入だけで追加できます:

```ts
declare module "@cc-discord-framework/core" {
  interface Container {
    redis: RedisClient;
  }
}

// プラグインの install() 内、または login() 前に:
client.container.redis = createRedis();
```

## コンストラクター

### コンストラクター \{#constructor}

```ts
new Container(): Container;
```

#### 戻り値

`Container`

## プロパティ

### client \{#client}

```ts
readonly client: Client;
```

定義: [src/container.ts:33](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/container.ts#L33)

フレームワーククライアント。

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/container.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/container.ts#L36)

ルートの pino ロガー。

***

### stores \{#stores}

```ts
readonly stores: StoreRegistry;
```

定義: [src/container.ts:45](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/container.ts#L45)

すべてのコンポーネントストア。

***

### texts \{#texts}

```ts
readonly texts: ClientTexts;
```

定義: [src/container.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/container.ts#L42)

フレームワークがユーザーへ返す文言(解決済み)。
`new Client({ texts: { ... } })` で項目ごとに差し替えられます。

## アクセッサー

### services \{#services}

#### 署名を取得する

```ts
get services(): Services;
```

定義: [src/container.ts:48](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/container.ts#L48)

ロード済みサービスの名前付きレジストリ(`services/` から自動収束)。

##### 戻り値

[`Services`](../interfaces/Services.md)
