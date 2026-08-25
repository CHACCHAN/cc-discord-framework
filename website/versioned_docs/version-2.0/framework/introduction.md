---
sidebar_position: 1
---

# はじめに

**cc-discord-framework** は、Bun で Discord Bot を作るための
クラス指向フレームワークです。決められたディレクトリに決められた形の
クラスを置くだけで、フレームワークが自動でロード・登録・配線します —
「置くだけで、動く」が設計の中心です。

```ts
// src/commands/PingCommand.ts — このファイルを置くだけで /ping が生える
import { Command, type ChatInputCommandInteraction } from "@cc-discord-framework/core";

@Command.define({ description: "Pong! と返します。" })
export class PingCommand extends Command {
  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.reply("Pong!");
  }
}
```

## discord.js との関係

このフレームワークは discord.js の**置き換えではありません**。`Client` は
discord.js の `Client` をそのまま継承しており、discord.js の機能はすべて
そのまま使えます — その上に、コンポーネントの自動ロードとコマンド
ランタイムが載っているだけです。

さらに、discord.js の全 API は `@cc-discord-framework/core` から再エクスポート
されます。`GatewayIntentBits` も `EmbedBuilder` も各種の型も、Bot 側は
`@cc-discord-framework/core` を import するだけで完結し、discord.js を個別に
インストールする必要はありません。

## 特徴

- **規約 = 構造** — `commands/` にコマンド、`listeners/` にリスナー、
  `services/` に共有ロジック。ファイルを置くことが、そのまま登録に
  なります。登録コードや import の配線は書きません。
- **サービスの収束** — `services/` に置いたクラスは、どのコンポーネント
  からも import なしで `this.services.<名前>` として参照できます。
  宣言マージにより完全に型が付きます。
- **標準デコレータ** — メタデータは TC39 標準デコレータの
  `@Command.define({...})` で宣言します。デコレータは宣言するだけで、
  実行はローダーが行うため、import は副作用フリーです。
- **fail-fast** — 名前の重複、説明のないスラッシュコマンド、存在しない
  Precondition への参照など、検証できるものはすべて起動時に検証されます。
  設定ミスのある Bot が中途半端に動き出すことはありません。
- **差し替えられない値がない** — フレームワークがユーザーへ返す文言は
  `texts` オプションですべて上書きできます。ハードコードされていて
  変えられない文言は存在しません。
- **pino による構造化ログ** — ラッパー層のない素の pino です。
  コンポーネントごとに文脈付きの子ロガーが最初から用意されます。

## 対象読者

このドキュメントは、**このフレームワークで Discord Bot を作る人**の
ためのものです。TypeScript の基本(クラス、`async/await`)と、Discord Bot
の基礎概念(トークン、ギルド、スラッシュコマンド)を前提にしています。
discord.js を使ったことがあれば、その知識はすべてそのまま活きます。

:::note

フレームワークは **Bun 専用** です。Node.js はサポートされません。
Bun が TypeScript をそのまま実行するため、Bot にビルド工程はありません。

:::

## 次のステップ

- [インストール](./getting-started/installation.md) — 要件とセットアップ
- [最初の Bot](./getting-started/first-bot.md) — 最小の Bot を動かすまで
- [プロジェクト構成](./getting-started/project-structure.md) — 規約の全体像
- [コマンド](./guides/commands.md) — スラッシュ・プレフィックス・autocomplete
