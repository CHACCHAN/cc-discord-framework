# 検証コマンド一覧

変更の種類ごとに、何を回せば「壊していない」と言えるかをまとめます。

## コマンド

| コマンド | 場所 | 検証内容 |
| --- | --- | --- |
| `bun run typecheck` | ルート | `src/` + `tests/` の tsc(noEmit)。`@ts-expect-error` によるコンパイル時契約もここで強制されます |
| `bun test` | ルート | フレームワーク(`tests/`)+ 全プラグイン(`plugins/*/tests/`)のテストがまとめて走ります |
| `bun run build` | ルート | `tsc -p tsconfig.build.json` で `dist/` を出力。宣言ファイルの生成が通ることの確認を兼ねます |
| `bun run check` | ルート | 上の3つを順に実行 |
| `bun run typecheck` | 各 `plugins/<name>/` | プラグイン単体の型チェック(`customConditions: ["bun"]` でソースから型解決) |
| `bun test` | 各 `plugins/<name>/` | プラグイン単体のテスト |
| `bun run typecheck` | `client/` | リファレンス Bot の型チェック |
| `bun run check` | `client/` | **オフライン起動チェック** — `config/` の読み込みと合成、プラグイン4つの install、全コンポーネントのロード、ディスパッチャ接続までを、トークンもネットワークもなしで実行 |

最低ラインはルートの `bun run check` + `client/` の `bun run check` です。
コアのロード経路・メタデータ・`exports` に触れた場合は、`client/` の
チェックが「実物のプラグイン構成で起動できるか」を教えてくれます。

## 変更の種類ごとの目安

- **コアのロジック**(`src/`)— ルート `bun run check`。ディスパッチや
  ロード順に触れたら `client/ check` も。
- **デコレータ / メタデータ / tsconfig** — 上に加えて **dist のスモーク**
  (ビルドした `dist/index.js` を import してコンポーネントがロードされる
  ことの確認)。`"bun"` 条件のせいで、リポジトリ内の実行はすべて src を
  読むため、dist 経路の退行は意識して踏まない限り見えません
  ([デコレータとメタデータ](../architecture/decorator-metadata.md))。
- **プラグイン** — そのプラグインの `typecheck` + `test`、依存する側
  (`ai` を変えたら `client/`、`music` を変えたら `music-sources` と
  `client/`)の `typecheck`。
- **型の公開面**(`index.ts` の export、宣言マージ)— ルート
  `typecheck` に加えて `client/ typecheck`。利用者と同じ立場で型が
  通るかを見るためです。

## ミューテーション検証の文化

このリポジトリでは「テストが通っている」だけでは検証を終わりにしません。
**テストを書いたら(または重要な検査に触れたら)、対象コードへ意図的な
変異を仕込んで、テストが赤くなることを確かめます。**

例えば設定ローダー([`src/config.ts`](../../src/config.ts))に対しては、
次のような変異で `bun test` が失敗することを確認済みです:

- `priority` ソートを外す
- `intents` を合併ではなく後勝ちにする
- 「後勝ち」キーの衝突検査を外す
- `_` 始まりのスキップを外す
- `priority` を結果の `ClientOptions` に残す
- `createClient` の `overrides` をファイルより弱くする

1件でも「変異したのに緑のまま」があれば、それはテストの穴です — 変異を
戻す前にテストを足してください。

この文化が生まれた背景には、「設定できるのに実際には読まれていない」
死んだオプションが監査で複数見つかった経験があります。オプションを
足したら、**そのリーフ値を読んでいる箇所まで追い、値を変えたら出力が
変わることをテストで実証する** ところまでが実装です
([オプション設計の規約](../plugin-development/configuration.md))。

## CI について

現在 GitHub Actions にあるのはリリース時の npm publish だけです
([リリース手順](../release/process.md))。**push / PR で自動実行される
テスト CI はありません** — 上記のコマンドを手元で回すことが、マージ前の
検証のすべてです。
