---
sidebar_position: 7
---

# エラー処理

## エラー型

| 型 | 意味 |
| --- | --- |
| `FrameworkError` | フレームワークが投げるすべてのエラーの基底 |
| `ComponentLoadError` | コンポーネントのロード失敗(名前重複、不正メタデータ、未知の Precondition 参照、import 失敗)。`path` を持つ。 |
| `ConfigLoadError` | 設定の失敗。[設定ディレクトリ](./config-directory.md)の読み込み失敗(ディレクトリ / 設定ファイルが無い、default export が無い、キーの衝突、`intents` が無い — `path` を持つ)と、[`createEnv().required()`](./environment.md) の必須環境変数の未設定。 |
| `UserError` | `message` が Discord のユーザーに向けられたエラー。`identifier` と任意の `context` を持つ。 |

## 起動時: fail-fast

ロード時に検証できるものはすべて検証され、`client.load()` /
`client.login()` から `ComponentLoadError` が投げられます: 名前の重複、
説明のないスラッシュコマンド、イベントのないリスナー、未知の
Precondition 参照。設定ミスのある Bot が中途半端に起動することは
ありません。

`config/` を使う場合は、その前段の `createClient()` / `loadClientConfig()`
から `ConfigLoadError` が投げられます — クライアントが構築される前です。
`createEnv().required()` も同じです: 必須の環境変数が未設定なら、設定
ファイルの import 時点(= 同じく構築前)で `ConfigLoadError` になります。
解釈できないだけの値(真偽値・数値の書き間違い)は例外にならず
`warnings` に積まれます([環境変数](./environment.md))。

## 実行時: イベント + 既定動作

実行時の失敗はクライアントイベントになります。各イベントには、
**そのイベントのリスナーが1つもないときだけ**適用される既定動作があり、
制御を奪うにはリスナーを登録するだけです — 設定フラグはありません。

| イベント | 既定動作 |
| --- | --- |
| `commandDenied` `(error: UserError, payload)` | 呼び出した本人へ理由を返信(スラッシュはエフェメラル) |
| `commandError` `(error, payload)` | `UserError` → メッセージを返信、それ以外 → 構造化ログ + 汎用返信 |
| `listenerError` `(error, listener)` | 構造化ログ |

購読は `client.on(...)` でも `Listener` コンポーネントでもできます:

```ts title="src/listeners/CommandErrorListener.ts"
@Listener.define({ event: "commandError" })
export class CommandErrorListener extends Listener<"commandError"> {
  override async run(error: unknown, payload: CommandRunPayload) {
    this.logger.error({ err: error, command: payload.command.name }, "コマンドが失敗しました");
    // Sentry への送信、独自の返信など
  }
}
```

`CommandRunPayload` は判別可能な共用体です — `payload.type`
(`"chatInput" | "message" | "autocomplete"`)で絞り込むと、
インタラクションやメッセージへ完全な型で到達できます。

プラグインが発火するエラーイベント(公式 Music プラグインの
`musicError` など)も同じエミッターに乗るので、同じ形のリスナーで
購読できます。

## 応答文言を差し替える(texts)

フレームワークがエンドユーザーへそのまま返信する文言 — ギルド外からの
呼び出しの拒否、権限不足の拒否、コマンド失敗時の汎用返信 — は
クライアントの `texts` オプションに集約されています。**既定値は日本語の
まま、すべて差し替えられます。** ハードコードされていて変えられない文言は
ありません。指定した項目だけが既定値を上書きします。

```ts
new Client({
  texts: {
    guildOnly: "This command is server-only.",
    missingUserPermissions: (perms) => `Missing permissions: ${perms.join(", ")}`,
  },
});
```

| 項目 | 使われる場面 |
| --- | --- |
| `guildOnly` | ギルド内前提の権限チェックを持つコマンドが DM などから呼ばれた |
| `missingUserPermissions(perms)` | 実行者の権限不足(引数は不足している権限名の一覧) |
| `missingClientPermissions(perms)` | Bot の権限不足(同上) |
| `unknownPermissions` | 権限情報そのものを取得できなかったとき、権限名の代わりに一覧へ渡される文字列 |
| `commandError` | コマンドが予期しないエラーで失敗した |

既定値は `defaultClientTexts` として公開され、解決済みの文言は
`container.texts` に置かれます(部分指定を既定値へ重ねる
`resolveClientTexts()` も export されています)。
[設定ディレクトリ](./config-directory.md)を使う場合も同じキーです —
`defineConfig({ texts: {...} })`(「後勝ち」のキーなので、書けるのは
1ファイルだけです)。

対象は Discord のユーザーへ届く文言だけです。開発者向けのログや
ロード時のエラーは含まれません(それらは Discord へは送られません)。

## コマンド内の `UserError`

想定内の・ユーザーに見せたい失敗には throw してください。既定動作は
スタックトレースの記録ではなく返信になります:

```ts
override async chatInputRun(interaction: ChatInputCommandInteraction) {
  if (!interaction.inCachedGuild()) {
    throw new UserError("このコマンドはサーバー内でのみ使用できます。");
  }
}
```

## 隔離の保証

- コマンドやリスナーの例外がプロセスを落とすことはありません。
- リスナーのエラーは同じイベントの他のリスナーを止めません。
- `listenerError` のリスナー自身が投げた場合は直接ログされます —
  エラーループは起きません。
