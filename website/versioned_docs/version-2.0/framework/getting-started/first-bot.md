---
sidebar_position: 2
---

# 最初の Bot

最小の Bot は2ファイルです。エントリポイントと、コマンドを1つ:

```
src/
├── index.ts              ← エントリポイント
└── commands/
    └── PingCommand.ts    ← 置くだけで /ping になる
```

```ts title="src/index.ts"
import { Client, GatewayIntentBits } from "@cc-discord-framework/core";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

await client.login(); // トークンは DISCORD_TOKEN 環境変数(.env)から自動使用
```

```ts title="src/commands/PingCommand.ts"
import { Command, type ChatInputCommandInteraction } from "@cc-discord-framework/core";

@Command.define({ description: "Pong! と返します。" })
export class PingCommand extends Command {
  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.reply("Pong!");
  }
}
```

実行:

```sh
bun run src/index.ts
```

これで Bot は完成です。起動時にフレームワークがコンポーネントをロードし、
Discord へ接続し、`/ping` をスラッシュコマンドとして自動登録します。

## 何が起きたか

- エントリポイントと同じ階層の `commands/` が自動で走査され、
  `PingCommand` が発見されました。名前はクラス名から導出されます
  (`PingCommand` → `ping`)。
- `@Command.define` は説明を**メタデータ**として添えただけです —
  デコレータは宣言し、ローダーが実行します。
- ready 後、スラッシュ対応コマンドがまとめて Discord に登録されました。

## 開発ギルドに即時反映させる

グローバル登録のスラッシュコマンドは、反映に最大1時間かかることが
あります。開発中はクライアントに開発ギルドの ID を渡してください —
ギルドコマンドは即時反映されます:

```ts title="src/index.ts"
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  applicationGuildIds: ["<開発ギルドID>"],
});
```

## 開発のヒント

- 人間が読みやすいログで動かす:
  `bun run src/index.ts | bunx pino-pretty`
  ([ロギング](../guides/logging.md))
- Bun は `.env` を自動で読み込みます。`DISCORD_TOKEN` はそこに
  置いてください([インストール](./installation.md))。
- 設定が増えてきたら、`src/config/` ディレクトリに分けて
  `createClient()` から読み込めます —
  [設定ディレクトリ](../guides/config-directory.md)。

## 次のステップ

- [プロジェクト構成](./project-structure.md) — どこに何を置くか
- [コマンド](../guides/commands.md) — オプション、権限、メッセージコマンド
- [サービス](../guides/services.md) — import 不要で共有ロジックへ到達する
