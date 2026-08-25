---
sidebar_position: 8
---

# ロギング

フレームワークの標準ロガーは **[pino](https://getpino.io)** です —
ラッパー層はなく、そのまま使います。`client.logger` と `container.logger`
は pino インスタンスそのものであり、export される `Logger` /
`LoggerOptions` 型も pino 自身のものです。

## 設定

```ts
// pino のオプションを渡す…
const client = new Client({ intents: [...], logger: { level: "debug" } });

// …または構築済みの pino インスタンスを渡す(transport / serializer / redaction 等)
import { pino } from "pino";
const client = new Client({ intents: [...], logger: pino({ level: "debug" }) });
```

省略時は `pino({ level: "info" })` です。

## 構造化ロギング

フレームワークのログは構造化されています — コンポーネントのロード、
ディスパッチの失敗、同期結果はコンテキストフィールドを持ちます:

```json
{"level":30,"components":{"commands":5,"listeners":2},"msg":"フレームワークをロードしました"}
```

自分のログも同じ形で書いてください — データオブジェクトが先、
メッセージが後:

```ts
this.logger.info({ guildId, prefix }, "プレフィックスを更新しました");
this.logger.error({ err: error }, "ジョブが失敗しました");   // `err` はスタックトレースを保持
```

## 子ロガー

コンポーネントの `this.logger` は最初から `{ store, component }` が
束縛された子ロガーです — 設定なしでコンポーネント単位のフィルタが
可能です。さらにコンテキストに価値がある場面でだけ、追加の子を作って
ください:

```ts
const jobLogger = this.logger.child({ jobId });
```

## 開発時の出力

本番は stdout への NDJSON が基本です。人間向けには `pino-pretty` への
パイプを推奨します(Bun では worker-thread transport が不安定なことと、
コアを依存なしに保つため):

```sh
bun run src/index.ts | bunx pino-pretty
```

:::note

NDJSON の出力に素の `console.log` を混ぜると行が壊れます。Bot 内の
出力は `this.logger` / `client.logger` に寄せてください。

:::
