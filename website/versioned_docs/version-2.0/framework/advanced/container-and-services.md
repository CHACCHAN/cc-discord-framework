---
sidebar_position: 2
---

# コンテナと型の効かせ方

`Container` はフレームワーク全体のサービスを運びます。コンポーネントから
は `this.container`、セットアップコードからは `client.container` で
参照します。

組み込みのサービス:

| プロパティ | 型 | |
| --- | --- | --- |
| `container.client` | `Client` | フレームワーククライアント |
| `container.logger` | `Logger`(pino) | ルートロガー |
| `container.stores` | `StoreRegistry` | 全コンポーネントストア |
| `container.services` | `Services` | `services/` から収束したサービス群 |
| `container.texts` | `ClientTexts` | ユーザーへ返す文言(解決済み — [エラー処理](../guides/error-handling.md)) |

コンテナは**クライアント毎**です — グローバルシングルトンではないため、
並列テストや複数クライアント構成でも状態が混ざりません。

## まずはサービスコンポーネントを検討する

自分の共有ロジックを足したいときは、まず
[サービスコンポーネント](../guides/services.md)を検討してください —
`services/` にクラスを置くだけで `this.services.<名前>` に収束し、
ライフサイクル(`onLoad` / `onUnload`)も付いてきます。ほとんどの
共有ロジックはこれで足ります。

型を効かせる鍵は `Services` インターフェースの**宣言マージ**です。
サービスを定義したファイルに必ず併記します:

```ts title="src/services/ConfigService.ts"
@Service.define()
export class ConfigService extends Service {
  readonly ownerIds = ["..."];
}

declare module "@cc-discord-framework/core" {
  interface Services {
    config: ConfigService;
  }
}
```

これで、どのコンポーネントの `this.services.config` も完全に型付き
です。宣言マージは「名前 → 型」の対応を TypeScript に教えるだけで、
実行時の登録は `services/` に置いたことで既に済んでいます。

## コンテナへ直接値を載せる

コンポーネントの形を取らない値(プラグインが提供する接続など)を直接
コンテナに載せたい場合も、宣言マージ + 代入だけです:

```ts
declare module "@cc-discord-framework/core" {
  interface Container {
    redis: RedisClient;
  }
}

// login() 前(またはプラグインの install() 内)に:
client.container.redis = createRedis();
```

```ts
// コンポーネントから — 完全に型付き
await this.container.redis.get(key);
```

## 指針

- コンテナへの代入は **`client.login()` の前**(またはプラグインの
  `install` 内 — コンポーネントのロード前に走ります)に行い、`onLoad`
  から参照できるようにしてください。
- データベースについて: コアは Prisma / SQLite / Redis などの具体を一切
  知りません。DB はただのサービスです — `services/` に置いて `onLoad` で
  接続し、`onUnload` で閉じてください([サービス](../guides/services.md))。
- 細かい値をバラバラに生やすより、意味のまとまりごとに1つのサービスに
  してください。

## 宣言マージの置き場所

`declare module "@cc-discord-framework/core"` ブロックは、対象を定義した
ファイルに併記するのが規約です — `Services` はサービスのファイルに、
`Preconditions` は Precondition のファイルに
([Precondition](../guides/preconditions.md)参照)。定義と型の宣言が
同じ場所にあれば、ファイルを消したときに型も一緒に消えます。
