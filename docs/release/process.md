# リリース手順

フレームワーク本体(npm パッケージ `cc-discord-framework`)のリリース
フローと、その前後にやることをまとめます。

## 自動化されている部分: GitHub Release → npm publish

実体は [`.github/workflows/publish.yml`](../../.github/workflows/publish.yml)
です(2026-08 時点の全ステップ):

```mermaid
flowchart LR
    release["GitHub Release を publish"]
    trigger["Actions: on release(types: published)"]
    checkout["actions/checkout"]
    bun["oven-sh/setup-bun"]
    node["actions/setup-node(24.x)<br>registry-url: registry.npmjs.org"]
    install["bun install"]
    publish["npm publish --provenance --access public"]

    release --> trigger --> checkout --> bun --> node --> install --> publish
```

押さえておくべき事実:

- **トリガーは GitHub Release の published** です。タグを push しただけ
  では動きません。
- ジョブは `id-token: write` 権限を持ち、`--provenance` 付きで publish
  します(npm の provenance / OIDC 連携)。`setup-node` の
  `registry-url` 指定はこの publish のためのものです。
- `npm publish` は npm の仕組みとして `prepublishOnly` を実行します。
  ルートの [`package.json`](../../package.json) では
  `prepublishOnly: "bun run clean && bun run build"` なので、**ビルドは
  ワークフロー内で自動的に走ります**(dist を commit する必要は
  ありません)。
- **公開されるバージョンは `package.json` の `version`** です。Release の
  タグ名からは取られません — タグと `version` を一致させるのは人間の
  仕事です(不一致でもそのまま publish されてしまいます)。
- 公開物は `files` フィールドどおり `dist` + `src` + `README.md` です
  (`src` は `exports` の `"bun"` 条件のために必須 —
  [パッケージング](../plugin-development/packaging.md))。
- **このワークフローが publish するのはルートパッケージだけ** です。
  `plugins/*` の公開は自動化されていません(公開する場合は各プラグイン
  ディレクトリでの手動 `npm publish` になります)。各プラグインにも
  `prepack` があり、新規 checkout からでも公開前に `dist` を生成します。
- **ワークフローはテストを実行しません。** 検証はリリース前に手元で
  済ませるのが前提です(下記チェックリスト)。

## バージョニング

- ルート(フレームワーク)とプラグインは **独立したバージョン** を持ちます
  (2026-08 時点: ルート 2.0.0、各プラグイン 1.0.0)。
- semver の対象は Public API です — ルートは
  [`src/index.ts`](../../src/index.ts) の export、プラグインは
  export された型・オプション・イベント
  ([互換性の考え方](../plugin-development/compatibility.md))。
- フレームワークのメジャーを上げたら、各プラグインの
  `peerDependencies` の range 更新が必要かを必ず確認します。

## 公開前チェックリスト

1. `bun run check`(typecheck + 全テスト + build)が緑
2. `cd client && bun run typecheck && bun run check` が緑
   (実物のプラグイン構成でロードできる)
3. **dist のスモーク**: ビルドした `dist/index.js` を import して
   コンポーネントがロードされることを確認(リポジトリ内の実行はすべて
   `"bun"` 条件で src を読むため、dist の退行は意識して踏まない限り
   見えません —
   [デコレータとメタデータ](../architecture/decorator-metadata.md#ビルド-target-は-esnext-を維持すること))
4. `package.json` の `version` を上げる(タグ名と一致させる)
5. 公開対象ごとに `npm pack --dry-run` を実行し、`dist/index.js` と
   `dist/index.d.ts` が含まれ、manifest に `workspace:*` がないことを確認
6. GitHub Release を作成・publish → Actions の publish ジョブが緑に
   なることを確認

## website のバージョンスナップショット

公式サイト(`website/` — Docusaurus)は、リリースに合わせて **Stable
スナップショット** を切ります。現行ドキュメントは「Next 🚧」ラベル +
unreleased バナーで運用されており
([`website/docusaurus.config.ts`](../../website/docusaurus.config.ts))、
リリース時に次を実行します:

```sh
bun run --cwd website docusaurus docs:version <バージョン>
# 例: v2.0.0 のリリース時
bun run --cwd website docusaurus docs:version 2.0
```

これで現時点の `website/docs/` が `versioned_docs/` に凍結され、以後の
main の変更は Next にだけ載ります。スナップショット後に
`bun run website:build` が通ることを確認してからデプロイしてください。
