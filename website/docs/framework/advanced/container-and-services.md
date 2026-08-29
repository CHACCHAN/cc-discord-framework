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

## `container/` ディレクトリに置く

Prisma のような「プロジェクト全体で使い回すインスタンス」は、
`container/` ディレクトリにファイルを置くだけでコンテナへ自動登録
されます — どこで定義するか迷う必要はありません。

```ts title="src/container/prisma.ts"
import { defineContainerValue } from "@cc-discord-framework/core";
import { PrismaClient } from "@prisma/client";

export default defineContainerValue({
  create: () => new PrismaClient(),
  dispose: (prisma) => prisma.$disconnect(),
});

declare module "@cc-discord-framework/core" {
  interface Container {
    prisma: PrismaClient;
  }
}
```

```ts
// どのコンポーネントからも — 完全に型付き
await this.container.prisma.user.findMany();
```

仕組みと規約:

- コンテナ上の名前はファイル名から導出されます(`prisma.ts` → `prisma`、
  `my-db.ts` → `myDb`)。`name` オプションで明示もできます。
- `create` はクライアント毎に呼ばれます(async 可)。引数にコンテナが
  渡るので、`client` やプラグインの設定も参照できます。
- 登録は **サービスのロードより前** — サービスの `onLoad` から
  `this.container.prisma` を使えます。
- `dispose` は `client.destroy()` 時に **読み込みの逆順** で呼ばれます。
- ファイルの収集規則は他の規約ディレクトリと同じです — サブディレクトリ
  も対象、`_` 始まりのファイルは対象外(共有コードの置き場)。
- 名前の衝突や `defineContainerValue` を通していない default export は
  **起動時にエラー**になります(実行時に黙って壊れません)。

## コンテナへ直接値を載せる

セットアップコードから手で載せることもできます(プラグインが接続を
提供する場合など)。宣言マージ + 代入だけです:

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
  知りません。接続インスタンスそのものは `container/` に置くのが手軽です
  (`dispose` で閉じられます)。接続にロジック(クエリの共通化など)を
  持たせたい場合は、サービスとして `services/` に置いて `onLoad` で接続し、
  `onUnload` で閉じてください([サービス](../guides/services.md))。
- 細かい値をバラバラに生やすより、意味のまとまりごとに1つのサービスに
  してください。

## 宣言マージの置き場所

`declare module "@cc-discord-framework/core"` ブロックは、対象を定義した
ファイルに併記するのが規約です — `Services` はサービスのファイルに、
`Preconditions` は Precondition のファイルに
([Precondition](../guides/preconditions.md)参照)。定義と型の宣言が
同じ場所にあれば、ファイルを消したときに型も一緒に消えます。
