---
sidebar_position: 1
---

# インストール

## 要件

- **Bun 1.4+** — 唯一のサポートランタイムです。TypeScript をそのまま
  実行するため、Bot にビルド工程はありません。Node.js はサポートされません。
- **discord.js 14** はフレームワークに同梱され、`@cc-discord-framework/core`
  から再エクスポートされます。**Bot 側で discord.js を個別に
  インストール・import する必要はありません。**

## フレームワークを追加する

```sh
bun add @cc-discord-framework/core
```

これだけで discord.js も一緒に入ります。

:::warning[旧パッケージ(v1)に注意]

npm のスコープなしパッケージ `cc-discord-framework`(1.x 系)は旧世代の
もので、このドキュメントの内容とは別物です。v2 以降は
`@cc-discord-framework/core` を使ってください(公式プラグインも同じ
`@cc-discord-framework` スコープで公開されています)。

:::

## トークンを用意する

Bot のトークンは `DISCORD_TOKEN` 環境変数に置きます。Bun は
プロジェクトの `.env` を自動で読み込むので、ファイルを1つ作るだけです:

```sh title=".env"
DISCORD_TOKEN=your-bot-token
```

`client.login()` を引数なしで呼ぶと、このトークンが自動で使われます。
トークンをコードに書く必要はありません(`.env` は `.gitignore` に
入れてください)。

## TypeScript 設定

フレームワークは**標準(TC39)デコレータ**を使います —
`experimentalDecorators` は**有効にしないでください**(`emitDecoratorMetadata`
も不要です)。動作確認済みの `tsconfig.json`:

```jsonc title="tsconfig.json"
{
  "compilerOptions": {
    "lib": ["ESNext"],
    "target": "ESNext",
    "module": "Preserve",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "types": ["bun"],
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "strict": true
  }
}
```

:::note

`target: "ESNext"` が要点です。標準デコレータのメタデータ
(`Symbol.metadata`)を使うため、古い target へのダウンレベル出力では
動きません。

:::

## 次のステップ

準備はこれだけです。[最初の Bot](./first-bot.md) に進んでください。
