# cc-discord-framework 開発者ドキュメント

ここは **開発者向け** のドキュメントです — フレームワーク本体に手を入れる
Contributor と、プラグインを書く Plugin Author を読者にしています。

**Bot を作りたい方(Framework User)はここではなく公式サイトへ**:
<https://discord-framework.oss.cc-chacchan.com>(準備中)。
インストール、チュートリアル、コマンド・リスナー・サービスの書き方、
公式プラグインの使い方は、すべて公式サイト側にあります。

## 読者別ガイド

**プラグインを書きたい**(Plugin Author)

1. [プラグインとは何か](./plugin-development/overview.md) — Plugin interface と「エンジン vs Bot の機能」境界
2. [最小プラグインを0から](./plugin-development/creating-a-plugin.md)
3. [コンポーネント種別の追加](./plugin-development/component-kinds.md)
4. [サービスとイベント](./plugin-development/services-and-events.md) · [オプション設計の規約](./plugin-development/configuration.md)
5. [テスト](./plugin-development/testing.md) · [パッケージング](./plugin-development/packaging.md) · [互換性](./plugin-development/compatibility.md)

**フレームワーク自体を開発したい**(Contributor)

1. [開発環境](./development/setup.md) · [モノレポ構成](./development/monorepo.md)
2. [アーキテクチャ概要](./architecture/overview.md)から [architecture/](./architecture/) 一式
3. [検証コマンド](./development/validation.md) · [テスト戦略](./testing/strategy.md)
4. [リリース手順](./release/process.md)

## 目次

| ドキュメント | 内容 |
| --- | --- |
| [architecture/overview.md](./architecture/overview.md) | 全体アーキテクチャ: モジュール構成、依存規則、Public API の境界、不変条件 |
| [architecture/lifecycle.md](./architecture/lifecycle.md) | 構築 → load → login → destroy の内部順序と、コンポーネントのライフサイクル |
| [architecture/component-system.md](./architecture/component-system.md) | Component / ComponentStore / StoreRegistry、名前導出、自動探索(`collectModuleFiles`) |
| [architecture/decorator-metadata.md](./architecture/decorator-metadata.md) | TC39 デコレータ + `Symbol.metadata` の仕組み、ESNext target が必須な理由 |
| [architecture/dispatch.md](./architecture/dispatch.md) | CommandStore のディスパッチ(ゲート、texts、既定動作)、ListenerStore、エラー分離 |
| [architecture/config-loading.md](./architecture/config-loading.md) | 設定ディレクトリ(`config/`)の合成規則の内部実装 |
| [development/setup.md](./development/setup.md) | リポジトリでの開発環境: `bun install`、`link-self.ts`、`exports` の `"bun"` 条件の罠 |
| [development/monorepo.md](./development/monorepo.md) | ワークスペース構成、`client/` と `website/` の位置づけ |
| [development/validation.md](./development/validation.md) | 検証コマンド一覧と、ミューテーション検証の文化 |
| [plugin-development/overview.md](./plugin-development/overview.md) | プラグインとは何か、できること、守ってほしいこと |
| [plugin-development/creating-a-plugin.md](./plugin-development/creating-a-plugin.md) | 最小プラグインを0から書く |
| [plugin-development/component-kinds.md](./plugin-development/component-kinds.md) | 独自のコンポーネント種別を丸ごと追加する |
| [plugin-development/services-and-events.md](./plugin-development/services-and-events.md) | Service の提供とイベント発火の慣例 |
| [plugin-development/configuration.md](./plugin-development/configuration.md) | XOptions / XConfig / texts カタログという設定設計の規約 |
| [plugin-development/testing.md](./plugin-development/testing.md) | オフライン Client、fixtures、モックモデル、ミューテーション検証 |
| [plugin-development/packaging.md](./plugin-development/packaging.md) | package.json の書き方(peer / optional peer / exports の順序) |
| [plugin-development/compatibility.md](./plugin-development/compatibility.md) | Framework バージョンとの互換性、壊れやすい層の分離 |
| [testing/strategy.md](./testing/strategy.md) | テスト戦略全体: `bun test`、実プレイヤー結合、live 検証、flaky の扱い |
| [release/process.md](./release/process.md) | GitHub Release → npm publish の実フロー、公開前チェック |

## このリポジトリで守られている前提

どのドキュメントも次の前提の上に書かれています:

- **Bun 専用**(1.4+)。ファイル探索は `Bun.Glob`、テストは `bun test`、
  Bot は素の TypeScript のまま動きます。Node 互換の抽象化はありません。
- **標準(TC39)デコレータのみ**。`experimentalDecorators` /
  `reflect-metadata` は使いません。ビルド target は **ESNext を維持**します
  ([理由](./architecture/decorator-metadata.md))。
- **プロジェクト全体が日本語**です — コメント、JSDoc、エラーメッセージ、
  テスト名まで。新しいコードとドキュメントも日本語で書いてください。
- **変更できない値を作らない。** 既定値は構いませんが、利用者が差し替え
  られない色・文言・ラベル・上限は禁止です
  ([オプション設計の規約](./plugin-development/configuration.md))。
