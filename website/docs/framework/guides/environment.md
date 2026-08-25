---
sidebar_position: 6
---

# 環境変数

`.env` の値は「書いてあるが空」「カンマ区切り」「真偽値のつもりの文字列」
ばかりで、素の `Bun.env` を各所で読むと同じ整形コードが散らばります。
フレームワークの `createEnv()` は、その定番の読み方を型のついた形で
まとめたものです:

```ts title="src/config/_env.ts"
// 環境変数を読むのはこの1ファイルだけ、という形を推奨
import { createEnv } from "cc-discord-framework";

const reader = createEnv();

export const env = Object.freeze({
  ownerIds: reader.list("OWNER_IDS"),      // カンマ区切り → string[]
  aiModel: reader.text("AI_MODEL"),        // 未設定・空はどちらも null
  aiTools: reader.flag("AI_TOOLS", true),  // 真偽値(既定値つき)
  token: reader.required("SOME_API_KEY"),  // 無ければ ConfigLoadError
  warnings: reader.warnings,
});
```

:::note

Bun は `.env` を自動で読み込みます — dotenv などの追加パッケージは
不要です。なお `DISCORD_TOKEN` はここで読む必要がありません:
cc-discord-framework の `Client.login()` が、引数を省略したときに
`Bun.env.DISCORD_TOKEN` を読みます。

:::

## 読み出しメソッド

| メソッド | 返り値 | ふるまい |
| --- | --- | --- |
| `text(name)` | `string \| null` | 未設定と空文字はどちらも `null` に寄せます。前後の空白は落とします。 |
| `required(name)` | `string` | 未設定・空なら `ConfigLoadError` を投げます。無いと動かない値(トークンなど)にだけ使ってください。 |
| `list(name)` | `readonly string[]` | 区切り文字(既定はカンマ)で分けた一覧。前後の空白と空要素は落とし、未設定なら空配列です。 |
| `flag(name, fallback)` | `boolean` | 真偽値。未設定・空なら `fallback`。解釈できない値は `fallback` のまま `warnings` に積まれます。 |
| `number(name, fallback)` | `number` | 数値。未設定・空なら `fallback`。解釈できない値は `fallback` のまま `warnings` に積まれます。 |
| `warnings` | `readonly string[]` | ここまでの読み出しで見つかった問題(ライブビュー — 以後の読み出しで増えます)。 |

`flag()` が「有効」と解釈する語は `on` / `true` / `1` / `yes`、
「無効」は `off` / `false` / `0` / `no` です(小文字で比較)。

## 解釈できない値は「警告」になる

`flag()` や `number()` が解釈できない値を見ても、例外にはなりません —
既定値のまま `reader.warnings` に積まれます。環境変数の書き間違いは任意
機能の設定であることが多く、それで Bot 全体を落とさないためです。
起動時に `warnings` をログへ流すかどうかは呼び出し側が決めます:

```ts
for (const warning of env.warnings) {
  client.logger.warn({ scope: "config" }, warning);
}
```

無いと動かない値(トークンなど)にだけ `required()` を使ってください —
こちらは `ConfigLoadError` を投げます([エラー処理](./error-handling.md))。
[設定ディレクトリ](./config-directory.md)を使っている場合、
`config/_env.ts` の `required()` は設定ファイルの import 時点 —
つまりクライアントが構築されるより前 — で失敗します。

## 語彙と区切り文字の差し替え

真偽値の語彙(`trueWords` / `falseWords`)や `list()` の区切り文字は、
第2引数の `EnvOptions` で差し替えられます:

```ts
const reader = createEnv(Bun.env, { listSeparator: ";" });
```

## テストでは偽の環境を渡せる

警告は `createEnv()` が返すインスタンスに溜まり、モジュールレベルの
共有状態はありません。テストでは偽の環境をそのまま渡せます:

```ts
const reader = createEnv({ OWNER_IDS: "1,2" });
```
