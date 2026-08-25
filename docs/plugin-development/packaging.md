# パッケージング

プラグインを npm パッケージとして成立させる `package.json` と tsconfig の
書き方です。公式プラグイン4つの実物が手本になります。

## package.json の骨格

最小構成(utils —
[`plugins/utils/package.json`](../../plugins/utils/package.json) から
動作に関わる部分を抜粋。実物にはこのほか npm 掲載用のメタデータ
`repository` / `homepage` / `bugs` / `author` と、スコープ付きパッケージを
公開するための `publishConfig: { "access": "public" }` が入っています):

```jsonc
{
  "name": "@cc-discord-framework/utils",
  "version": "1.0.0",
  "license": "MIT",
  "description": "cc-discord-framework 公式プラグイン: 小さな便利機能の詰め合わせ(定期実行・埋め込み・ページネーション・確認 UI・整形)",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "bun": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist", "src", "README.md"],
  "scripts": {
    "clean": "rm -rf dist",
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc --noEmit",
    "prepack": "bun run clean && bun run build"
  },
  "peerDependencies": {
    "@cc-discord-framework/core": "^2.0.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^6.0.3"
  }
}
```

要点を1つずつ:

- **`exports` は `"bun"` → `"types"` → `"import"` の順。この順序は
  変えられません。** Bun 実行時は `"bun"` 条件で `src/` の TypeScript を
  直接読みます(利用者の Bot にビルド工程がないのはこのため)。そして
  TypeScript は `exports` の **記述順** で条件を試すため、`"types"` を
  先に書くと `customConditions: ["bun"]` を設定していても dist の型が
  勝ってしまいます([開発環境](../development/setup.md#exports-の-bun-条件と型解決の罠))。
- **`files` に `dist` と `src` の両方** を入れます。`"bun"` 条件が
  `src/` を指す以上、src を同梱しないと Bun 利用者のパッケージが
  壊れます。dist は Node 系ツールと型のためです。
- **単一エントリ**(`"."`)だけを公開します。深い import を許すと
  内部構造が Public API になってしまいます
  ([Public API の境界](../architecture/overview.md#public-api-の境界))。
- **`prepack` で必ずクリーンビルドします。** `dist/` は commit しないため、
  新規 checkout から `npm pack` / `npm publish` しても `main` と `types` が
  存在する tarball になるよう、公開ライフサイクル自身にビルドを含めます。

## 依存の3分類

| 分類 | 使いどころ | 実例 |
| --- | --- | --- |
| `peerDependencies` | フレームワーク本体、および「利用者側と同一インスタンスであるべき」パッケージ | 全プラグインの `@cc-discord-framework/core: ^2.0.0`、music-sources の `@cc-discord-framework/music` |
| `dependencies` | プラグインが自分で抱え込んでよい実装詳細 | music の `@discordjs/voice` / `opusscript`、ai の `ai` / `zod`、music-sources の `youtubei.js` / `soundcloud.ts` |
| optional peer(`peerDependenciesMeta`) | 利用者が **使うものだけ入れる** 重い依存 | ai の `@ai-sdk/*`(下記) |

`@cc-discord-framework/core` を peer にするのは、`Container` / `Stores` /
`Services` の宣言マージとストア解決が **利用者と同じモジュール
インスタンス** を前提にするためです。dependency にすると二重
インスタンスになり、宣言マージも `instanceof` も壊れます。

`discord.js` は個別に依存しません — フレームワークが再エクスポート
しているので、`@cc-discord-framework/core` から import します(公式
プラグインはすべてそうしています)。

## optional peer + 動的 import パターン

「対応はしたいが、全員に入れさせたくない」依存は optional peer にして、
**名指しされたときだけ動的 import** します。ai プラグインの
`@ai-sdk/*` が実例です。

宣言側([`plugins/ai/package.json`](../../plugins/ai/package.json)、抜粋):

```jsonc
"peerDependencies": {
  "@ai-sdk/anthropic": "^4.0.0",
  "@ai-sdk/google": "^4.0.0",
  "@ai-sdk/openai": "^4.0.0",
  "@ai-sdk/openai-compatible": "^3.0.0",
  "@cc-discord-framework/core": "^2.0.0"
},
"peerDependenciesMeta": {
  "@ai-sdk/anthropic": { "optional": true },
  "@ai-sdk/google": { "optional": true },
  "@ai-sdk/openai": { "optional": true },
  "@ai-sdk/openai-compatible": { "optional": true }
}
```

実装側([`plugins/ai/src/models.ts`](../../plugins/ai/src/models.ts)の
方針コメント):

> `@ai-sdk/*` は optional peer dependency です。**静的に import すると、
> 使っていないプロバイダーが入っていないだけで起動が落ちます。**
> そのため文字列で名指しされたときにだけ動的 import し、失敗したら
> 「`bun add ...` してください」と分かる `ProviderNotInstalledError` を
> 投げます。

パターンとしての要点:

- 静的 `import` は書かない(型だけなら `import type` は可 — 消えるので
  安全です)。
- `await import(pkg)` の失敗を捕まえ、**何を `bun add` すればよいかが
  分かる専用エラー** に変換する。
- 読み込み結果はインスタンス内にキャッシュし(モジュールレベルには
  置かない)、動的 import はパッケージごとに1度だけにする。

## tsconfig

プラグインの `tsconfig.json`(typecheck 用)はルートと同じ設定 +
`customConditions: ["bun"]` で、`src/**/*` と `tests/**/*` を含みます。
ビルド用の `tsconfig.build.json` はそれを extends して `dist/` へ宣言
ファイル付きで出力します。

**target は ESNext のまま維持してください** — 下げると標準デコレータの
メタデータが Bun で黙って消えます
([デコレータとメタデータ](../architecture/decorator-metadata.md#ビルド-target-は-esnext-を維持すること))。

## リポジトリ内(ワークスペース)での依存

リポジトリ内の相互参照はワークスペース解決に乗せます:

- プラグイン → フレームワーク: peer のまま。実体は開発時に
  `bun run link:self` で作るセルフリンクから解決されます
  ([開発環境](../development/setup.md#link-selfts-の仕組み))。
- プラグイン → 別プラグイン(dependency): `"@cc-discord-framework/utils":
  "^1.0.0"`(ai が実例)。
- プラグイン → 別プラグイン(peer): `"@cc-discord-framework/music":
  "^1.0.0"` を peer に書く(music-sources が実例)。

公開パッケージの manifest に `workspace:*` を残すと、npm などで tarball を
導入したときに解決できません。公開されるプラグイン同士は実バージョンの
semver range を書きます。Bun は range とローカル workspace のバージョンが
一致すれば、リポジトリ内では引き続き workspace をリンクします。
