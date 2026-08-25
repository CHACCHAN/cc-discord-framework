# コントリビューションガイド

cc-discord-framework への改善提案・不具合修正・ドキュメント更新を歓迎します。
本プロジェクトは CHACCHAN が個人で保守しており、レビューや取り込みまでの
時間は保証していません。大きな API 変更は、実装前に Issue で目的と利用者への
影響を相談してください。

## 現在の開発対象

`main` は npm 公開済みの **v2**(`@cc-discord-framework/core`)を対象に
しています。旧パッケージ `cc-discord-framework`(npm latest = v1.0.5)は
旧仕様の v1 で、v2 とは API 非互換です。報告や Pull Request では、対象の
版またはコミットを明記してください。

## 開発を始める

必要なランタイムは Bun 1.4+ です。Node.js は実行対象ではありません。

```sh
git clone https://github.com/CHACCHAN/cc-discord-framework.git
cd cc-discord-framework
bun install
bun run link:self
bun run check
```

構成と開発環境の詳細は [`docs/development/setup.md`](./docs/development/setup.md)、
プラグイン開発は [`docs/plugin-development/`](./docs/plugin-development/) を
参照してください。

## 変更時の確認

- コード・テスト名・利用者向けドキュメントは、既存方針に合わせて日本語で書く
- 不具合修正には、修正前に失敗する回帰テストを追加する
- 重要なテストは、対象条件を一時的に壊して実際に失敗することも確認する
- Public API や挙動を変えた場合は、README と該当ドキュメントを同時に更新する
- 無関係な整形やリファクタリングを同じ Pull Request に混ぜない

提出前に、最低限次を実行してください。

```sh
bun run check
bun run --cwd client typecheck
bun run --cwd client check
bun run website:build
```

プラグインを変更した場合は、そのディレクトリでも `bun run typecheck` と
`bun run build` を実行します。検証範囲の詳細は
[`docs/development/validation.md`](./docs/development/validation.md) にあります。

## Issue と安全な報告

不具合と改善提案は [Issue テンプレート](https://github.com/CHACCHAN/cc-discord-framework/issues/new/choose)
から送ってください。Bot token、API key、個人情報は Issue や Pull Request に
含めないでください。未修正の脆弱性を公開 Issue に投稿しないことなど、現在の
受付方針は [`SUPPORT.md`](./SUPPORT.md) に記載しています。

