---
sidebar_position: 3
---

# プロジェクト構成

このフレームワークでは、**規約がそのまま構造**です。エントリポイントと
同じ階層の**種別名ディレクトリ**が自動で走査され、決められた場所に
決められた形のクラスを置くことが、そのまま登録になります:

```
src/
├── index.ts          ← エントリポイント(この階層が自動探索のルート)
├── commands/         ← Command を置く
│   └── PingCommand.ts
├── listeners/        ← Listener を置く
│   └── ReadyListener.ts
├── preconditions/    ← Precondition(コマンドのガード)を置く
├── services/         ← Service(共有ロジック)を置く
├── container/        ← コンテナへ載せる共有インスタンス(Prisma など)を置く
└── config/           ← 設定ディレクトリ(createClient を使う場合)
```

プラグインが種別を足すこともあります — たとえば公式 Utils プラグインを
使うと `tasks/` に定期実行タスクを置けるようになります。どの種別でも
規約は同じです。

## 自動探索のルートはエントリファイルの場所

自動探索のルート(`baseDirectory`)の既定は、**実行したエントリファイル
のあるディレクトリ**です(`src/index.ts` を実行すれば `src/`)。
[設定ディレクトリ](../guides/config-directory.md)の既定の場所
(`src/config/`)も同じ規則で決まります。

:::warning[エントリファイルは動かさない]

`baseDirectory` はエントリファイルに追従するため、エントリを別の場所へ
動かすと**エラーも出さずに全ストアが空になります**。起動チェック用
スクリプトのように2つめのエントリを作る場合は、1つめと同じディレクトリに
置いてください(`src/index.ts` と `src/check.ts`)。どちらを `bun run`
しても同じ `config/` と同じ `baseDirectory` が導かれます。

:::

ルートは `new Client({ baseDirectory })` で明示でき、`null` を渡すと
自動探索そのものを無効化できます(明示登録のみになります —
[コンポーネント](../advanced/components.md))。

## 名前はクラス名から決まる

コンポーネント名は、クラス名から**種別サフィックスを除去**して導出
されます。種別ごとに自然な形に整えられます:

| 種別 | 変換 | 例 |
| --- | --- | --- |
| Command | ケバブケース | `PingCommand` → `ping`、`UserInfoCommand` → `user-info` |
| Listener | ケバブケース | `ReadyListener` → `ready` |
| Precondition | 大文字小文字を保持 | `OwnerOnlyPrecondition` → `OwnerOnly` |
| Service | lowerCamelCase | `ConfigService` → `config`、`GuildSettingsService` → `guildSettings` |

導出名を使いたくない場合は `@X.define({ name: "..." })` で明示できます。
名前はストア内で一意で、衝突は起動時エラーです。

## サブディレクトリは整理のためだけ

各ディレクトリの中はサブディレクトリで自由に分けられます
(`commands/music/PlayCommand.ts` など)。**サブディレクトリは整理の
ためだけで、コンポーネント名には影響しません** — 名前は常にクラス名から
決まります(`commands/music/PlayCommand.ts` → `play`)。

## `_` で始まるファイルは読み込まれない

`_` で始まる**ファイルとディレクトリ**は共有コード扱いで、自動探索から
スキップされます。コマンド間の共通処理は `commands/_shared.ts` や
`commands/_internal/` に置き、各ファイルから普通に import してください。

そのほかにスキップされるもの:

- 型定義(`*.d.ts`)
- テスト(`*.test.*` / `*.spec.*`)
- クラスでない export、種別と無関係な export

読み込み順はパスのソート順です — 決定的ですが、名前とは無関係です。

## `config/` は設定ディレクトリ

`config/` はコンポーネント種別のディレクトリと同じ並びに置きますが、
コンポーネントではなく**設定ファイル**の置き場です(`config` という
名前のストアは存在しないので、自動探索に拾われることはありません)。
詳しくは[設定ディレクトリ](../guides/config-directory.md)を参照して
ください。
