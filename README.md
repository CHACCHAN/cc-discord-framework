# cc-discord-framework

**Bun 専用**・Class 指向の Discord Bot フレームワーク
([discord.js](https://discord.js.org) v14 ベース)。

**決められたディレクトリ + 名前でクラスを作れば、フレームワークが自動で
インポートして制御します。** Bot 側のコードはエコシステムに載せるだけです。

```ts
// src/index.ts — エントリポイントはこれだけ
import { Client, GatewayIntentBits } from "@cc-discord-framework/core";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
await client.login(); // トークンは DISCORD_TOKEN 環境変数から自動使用
```

```ts
// src/commands/PingCommand.ts — 置くだけで /ping が動く
import { Command, type ChatInputCommandInteraction } from "@cc-discord-framework/core";

@Command.define({ description: "Pong! と返します。" })
export class PingCommand extends Command {
  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.reply("Pong!");
  }
}
```

> [!IMPORTANT]
> v2 は **`@cc-discord-framework/core`** として npm に公開されています。
> 旧パッケージ `cc-discord-framework`(npm latest = v1.0.5)は旧仕様の v1 で、
> v2 とは API 互換ではありません。今後の開発はすべて
> `@cc-discord-framework` スコープで行われます。

本プロジェクトは **CHACCHAN** が設計・実装・ドキュメントを保守する
個人メンテナンスの OSS です。現在地と変更は
[GitHub の履歴](https://github.com/CHACCHAN/cc-discord-framework/commits/main)、
質問・不具合の入口は [サポート方針](./SUPPORT.md) と
[Issues](https://github.com/CHACCHAN/cc-discord-framework/issues) で公開しています。
改善へ参加する場合は [コントリビューションガイド](./CONTRIBUTING.md) を
先に確認してください。

## 特徴

- **Bun 専用。** TypeScript をそのまま実行 — ビルド工程なし、探索は
  `Bun.Glob`、テストは `bun test`。Node.js はサポートしません。
- **規約が構造を決める。** `services/` `commands/` `listeners/`
  `preconditions/`(+ プラグインの種別)にクラスを置くことが、そのまま
  登録になります。設定も同じで、増えてきたら `config/` に分けて
  `createClient()` で読み込めます(`plugins` は連結、`intents` は合併)。
- **Class 指向 + 標準デコレータ。** 振る舞いは基底クラスの継承で、宣言的
  な設定は標準(TC39)の `@X.define({...})` で。legacy デコレータも
  `reflect-metadata` も、コンストラクタの引き回しもありません。
- **収束。** discord.js の全 API は `@cc-discord-framework/core` から
  再エクスポート — Bot 側の import は1パッケージで完結。サービスは
  `this.services.<名前>` に集まり、コンポーネント同士の import は不要です。
- **小さなコアと本物の拡張点。** コアはサービス・コマンド・リスナー・
  Precondition だけ。プラグインは独自のデコレータ・ディレクトリ・
  ライフサイクルを持つ **新しいコンポーネント種別** を、Public API だけで
  丸ごと追加できます。
- **公式プラグイン。** `plugins/` に独立パッケージとして用意
  ([utils](./plugins/utils/) = 定期実行・確認 UI・ページ送り・整形、
  [ai](./plugins/ai/) = 複数プロバイダー対応の AI(ツールは `ai/` に置くだけ)、
  [music](./plugins/music/) = 音楽再生、
  [music-sources](./plugins/music-sources/) = YouTube / SoundCloud)。
  重い依存はコアへ持ち込みません。
- **型はマージで効かせる。** リスナー引数、ストア参照、サービス、
  Precondition 名 — 手動のジェネリクス指定なしに型が通ります。
- **pino による構造化ログ**、起動時の fail-fast 検証、既定動作付きの
  エラーイベント。

## インストール

```sh
bun add @cc-discord-framework/core
```

discord.js は同梱・再エクスポートされるため、個別のインストールは
不要です。

なお npm の `cc-discord-framework`(スコープなし)は互換性のない
旧 v1 系です。v2 以降は必ず `@cc-discord-framework/core` を使ってください。

## ドキュメント

- **利用者向け(Bot を作る)**: 公式サイト
  <https://discord-framework.oss.cc-chacchan.com>(準備中)—
  チュートリアル、概念解説、公式プラグインの使い方
- **開発者向け(フレームワーク開発 / プラグイン作成)**:
  [docs/](./docs/README.md)
- リファレンス Bot: [`client/`](./client/) — 実運用中の音楽 + AI Bot
  (全コンポーネント種別と `config/` 規約の実例)

npm: [`@cc-discord-framework/core`](https://www.npmjs.com/package/@cc-discord-framework/core)
(公式プラグインも同じ [`@cc-discord-framework`](https://www.npmjs.com/org/cc-discord-framework) スコープに集約)

## リポジトリでの開発

```sh
bun install         # ワークスペース: フレームワーク + client
bun run link:self   # ルートパッケージを開発用にセルフリンク
bun run typecheck   # src/ と tests/ の tsc
bun test            # フレームワークのテスト
bun run build       # dist/ の出力(型 + ESNext JS)

cd client
bun run check       # 参照 Bot をオフライン起動(トークン不要)
```

## ライセンス

MIT License([LICENSE](LICENSE))
