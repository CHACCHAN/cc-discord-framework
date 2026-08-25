# 開発環境

## 前提

- **Bun 1.4+** — 唯一のランタイムです。フレームワークもテストも Bot も
  Bun で動かします(Node.js はサポートしません)。
- TypeScript は devDependency として入ります(`bun install` に含まれる)。
  型チェックとビルドにだけ使い、実行は常に Bun です。

## セットアップ

```sh
git clone https://github.com/CHACCHAN/cc-discord-framework.git
cd cc-discord-framework
bun install
bun run link:self
```

`bun install` がワークスペース(`client`、`plugins/*`、`website`)を
まとめて解決します。続く `bun run link:self` が開発用のセルフリンクを
作ります(後述)。

## リポジトリ構成

```
cc-discord-framework/
├── src/                 フレームワーク本体(Public API は src/index.ts だけ)
├── tests/               フレームワークのテスト + fixtures
├── plugins/             公式プラグイン(独立パッケージ、各自 src/ + tests/)
├── client/              リファレンス Bot(実運用されている)
├── website/             公式サイト(Docusaurus — 利用者向けドキュメント)
├── docs/                このドキュメント(開発者向け)
├── scripts/link-self.ts 開発用のセルフリンク
├── tsconfig.json        noEmit の型チェック用(src/ + tests/)
└── tsconfig.build.json  dist/ 出力用(target ESNext 必須)
```

各ディレクトリの位置づけは[モノレポ構成](./monorepo.md)を参照して
ください。

## `link-self.ts` の仕組み

リポジトリ内のプラグインと `client/` は、公開時とまったく同じ
`import "@cc-discord-framework/core"` でフレームワークを解決します。tsconfig の
`paths` による読み替えは **使っていません**。

これを成立させているのが
[`scripts/link-self.ts`](../../scripts/link-self.ts) です:

- ルートパッケージ自身は Bun のワークスペースメンバーになれないため、
  `bun install` はローカルの `src/` を指す
  `node_modules/@cc-discord-framework/core` を作りません(レジストリ版が
  peer として入ることはあります)。
- そこでセットアップ時に `bun run link:self` を明示的に実行し、セルフリンク
  `node_modules/@cc-discord-framework/core -> リポジトリルート` を張ります。
  これでリポジトリ内のコードは常に手元の `src/` に対して動きます。
- 公開パッケージのインストール時にはこの開発専用スクリプトを実行しません。
  tarball に含まれない `scripts/` を参照して利用者のインストールを
  壊さないためです。
- `node_modules` がまだ無ければ何もせず、既存のシンボリックリンクは
  張り替え、**実体がある場合は触りません**。

リンクが壊れた(プラグインの import が解決できない)ときは
`bun run link:self` を実行すれば復旧します。

## `exports` の `"bun"` 条件と型解決の罠

各パッケージ(ルートとプラグイン)の `exports` は3条件です
([`package.json`](../../package.json)):

```jsonc
"exports": {
  ".": {
    "bun": "./src/index.ts",      // ← 必ず "types" より先に書く
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js"
  }
}
```

- **Bun 実行時** は `"bun"` 条件が効き、ビルドせずに常に最新の `src/` が
  読まれます。リポジトリ内の `client/` やプラグインが「ビルド忘れの dist」
  を掴まないのはこのためです。
- **TypeScript** も各 tsconfig の `customConditions: ["bun"]`
  (例: [`client/tsconfig.json`](../../client/tsconfig.json))によって
  同じ条件で解決し、`src/index.ts` から直接型を取ります。

ここに罠が1つあります: **TypeScript は `exports` に書かれた順で条件を
試す** ため、`"types"` を `"bun"` より先に書くと `customConditions` を
設定していても `"types"` が勝ち、**古い dist の型で型チェックされます**。
実際にこの並び間違いで「client の typecheck が通っている」が嘘になって
いたことがあります(dist が古いまま緑になる)。

確認方法:

```sh
cd client && bunx tsc --noEmit --listFiles | grep plugins/
```

これが `plugins/*/dist/*.d.ts` ではなく `plugins/*/src/*.ts` を並べて
いれば、ソースから型が取れています。

## tsconfig の決めごと

[`tsconfig.json`](../../tsconfig.json)(型チェック用)と
[`tsconfig.build.json`](../../tsconfig.build.json)(dist 出力用)の
要点:

- `target: "ESNext"` — **下げてはいけません**。tsc のダウンレベル
  デコレータ出力は Bun でメタデータが黙って消えます
  ([デコレータとメタデータ](../architecture/decorator-metadata.md))。
- `module: "Preserve"` + `moduleResolution: "bundler"` +
  `verbatimModuleSyntax: true` — Bun の解決に合わせた設定です。
- `experimentalDecorators` / `emitDecoratorMetadata` は **存在しません**。
  追加しないでください。
- 型チェック用 tsconfig は `tests/**/*` を含みます —
  `@ts-expect-error` によるコンパイル時契約のテストが typecheck で
  強制されるためです。
- ビルドは `tsc -p tsconfig.build.json`(`src/` → `dist/`、宣言ファイル
  付き)。プラグインも同じ構成の `tsconfig.build.json` を持ちます。

## 日々のコマンド

```sh
bun run typecheck   # src/ + tests/ の tsc(noEmit)
bun test            # フレームワーク + 全プラグインのテスト
bun run build       # dist/ の出力
bun run check       # 上の3つをまとめて
cd client && bun run check   # リファレンス Bot のオフライン起動(トークン不要)
```

それぞれが何を保証するかは[検証コマンド一覧](./validation.md)を参照して
ください。
