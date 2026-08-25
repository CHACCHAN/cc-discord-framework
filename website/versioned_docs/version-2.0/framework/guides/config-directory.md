---
sidebar_position: 5
---

# 設定ディレクトリ

設定が1ファイルに収まらなくなったら、`config/` ディレクトリに分けられ
ます。`new Client({...})` はこれまでどおり動きます — **小さいうちは
`new Client`、機能ごとの設定が増えてきたら `config/`** という使い分けで、
どちらを選んでもコンポーネントの書き方は何も変わりません。

```ts title="src/index.ts"
// エントリポイントはこれだけになる
import { createClient } from "@cc-discord-framework/core";

const client = await createClient();
await client.login();
```

`createClient()` は設定ディレクトリを読んで1つの `ClientOptions` に
まとめ、`new Client(...)` へ渡すだけの関数です。`load()` はしないので、
`login()`(または `load()`)を呼ぶまで副作用は起きません。

```
src/
├── index.ts           ← エントリポイント(コンポーネント自動探索のルート)
├── config/            ← 設定ディレクトリ
│   ├── _env.ts        共有コード(`_` 始まりは設定として読み込まれない)
│   ├── client.ts      intents など、フレームワーク自体の設定
│   ├── music.ts       機能ごとの設定 — プラグインと、それに要る intent
│   └── ai.ts
├── commands/
└── services/
```

`config/` はコンポーネント種別のディレクトリ(`commands/` など)と同じ
並びに置きます。`config` という名前のストアは存在しないので、
コンポーネント自動探索に拾われることはありません — Bot のコードは
`src/` の下で完結します。

各ファイルは `defineConfig` で `ClientConfig` を default export します。
`ClientConfig` は `ClientOptions` の部分指定に、ローダーだけが読む
`priority` を足したものです:

```ts title="src/config/music.ts"
import { defineConfig, GatewayIntentBits } from "@cc-discord-framework/core";
import { music } from "@cc-discord-framework/music";

export default defineConfig({
  priority: 50,
  intents: [GatewayIntentBits.GuildVoiceStates],
  plugins: [music()],
});
```

## 読み込まれるファイルと順序

対象になるファイルは、コンポーネント自動探索とまったく同じ規則で
決まります(サブディレクトリも再帰的に走査し、`_` で始まるファイル・
ディレクトリ、`*.d.ts`、`*.test.*` / `*.spec.*` はスキップ)。

読み込み順は **`priority` の降順 → パスの昇順**です。`priority` は
大きいほど先で、書かなければ `0` です。この順序がそのままプラグインの
インストール順になるため、「テーマや UI を用意する層を先に、それに乗る
層を後に」といった順序を、ファイルをまたいで決められます。`priority` は
ローダーが消費するので、結果の `ClientOptions` には残りません。

## 3つのまとめ方

| キー | まとめ方 |
| --- | --- |
| `plugins` | **連結**。読み込み順に並び、1つのファイル内に並べた分はその配列順を保ちます。 |
| `intents` / `partials` / `applicationGuildIds` | **合併**(union)。重複は除かれます。 |
| それ以外 | **後勝ち**。ただし2つ以上のファイルが同じキーに違う値を書いていたらエラーです。 |

「後勝ち」に衝突エラーが付いているので、`defaultPrefix` や `logger` の
ようなキーを実際に書けるのは1ファイルだけです。どちらが採用されるか
読めない設定は、そもそも書き間違いだからです(比較は `Object.is` なので、
同じ内容のオブジェクトリテラルでも別の値として衝突します)。

合併されるキーの中では `intents` が要点です。**ある機能のためだけに要る
intent を、その機能の設定の隣に置ける**ようになります:

```ts title="src/config/client.ts"
// どの機能でも要る分だけ
export default defineConfig({ intents: [GatewayIntentBits.Guilds] });
```

```ts title="src/config/music.ts"
// 音楽再生のためだけに要る分
export default defineConfig({
  intents: [GatewayIntentBits.GuildVoiceStates],
  plugins: [music()],
});
```

クライアントに渡るのは合併後の `Guilds | GuildVoiceStates` です。音楽を
やめるときは `config/music.ts` を消すだけで、要らなくなった intent も
一緒に消えます。

## `_` で始まるファイル

`config/_env.ts` のように `_` で始まるファイルは設定として読み込まれ
ません。環境変数の読み出しのような**設定そのものではない共有コード**は
ここに置き、各設定ファイルから import します。コンポーネント自動探索の
`_shared.ts` と同じ規約です。環境変数の読み出しそのものは
[`createEnv()`](./environment.md) にまとまっています。

## エントリファイルは動かさない

設定ディレクトリの既定は **`<エントリファイルのディレクトリ>/config`**
(`src/index.ts` に対する `src/config/`)で、`baseDirectory` と同じく
実行したエントリファイルの場所から導かれます。

:::warning

**エントリファイルの位置は動かさないでください。** 自動探索のルートで
ある `baseDirectory` もエントリに追従するので、動かすと**エラーも出さずに
全ストアが空になります**。

同じ理由で、起動チェック用のスクリプトのように**2つめのエントリを作る
場合は1つめと同じディレクトリに置いてください**(`src/index.ts` と
`src/check.ts`)。どちらを `bun run` しても同じ `config/` と同じ
`baseDirectory` が導かれます。

:::

## ディレクトリを明示する・上書きする

ディレクトリは引数で渡せます(文字列 — カレントディレクトリ基準で解決
されます — または `URL`)。第2引数の `overrides` はファイルの内容の上に
素直に後勝ちで重なります。衝突検査はしないので、テストや一時的な上書きの
逃げ道として使えます:

```ts
const client = await createClient(new URL("./fixtures/config", import.meta.url), {
  baseDirectory: null,    // 自動探索を切る(テスト向け)
});
```

`ClientOptions` を組み立てるところで止めたいときは
`loadClientConfig(directory?)` を使います。`createClient` は、これと
`new Client(...)` を繋いだだけの関数です。

## 起動時に失敗すること

設定の取りこぼしは、Discord へ接続する前に `ConfigLoadError`
([エラー処理](./error-handling.md))になります:

- 設定ディレクトリが無い、または設定ファイルが1つもない
- 設定ファイルのインポートに失敗した
- default export が設定オブジェクトでない(`_` 始まりへ逃がす案内が出ます)
- `priority` が数値でない
- 2つのファイルが同じキーに違う値を書いている(両方のパスが出ます)
- どの設定ファイルにも `intents` が無い
