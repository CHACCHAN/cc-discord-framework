# サポート

cc-discord-framework は CHACCHAN が個人で保守しているオープンソース
プロジェクトです。回答時間の保証や個別の有償サポートは、現時点では
設けていません。

## はじめに確認する場所

- v2 Next の導入と現在の公開状況:
  [インストールガイド](./website/docs/framework/getting-started/installation.md)
- フレームワークの使い方: [`website/docs/framework/`](./website/docs/framework/)
- 公式プラグイン: [`website/docs/plugins/`](./website/docs/plugins/)
- 既知の問題と過去の相談:
  [GitHub Issues](https://github.com/CHACCHAN/cc-discord-framework/issues)

このリポジトリとサイトのドキュメントは、npm 公開済みの **v2**
(`@cc-discord-framework/core`)を対象にしています。旧パッケージ
`cc-discord-framework`(npm latest = v1.0.5)は旧仕様の v1 で、v2 の API
とは互換ではありません。相談時は、どちらを使っているかを明記してください。

## Issue を作るとき

再現と切り分けができるよう、可能な範囲で次を添えてください。

1. 利用中の版またはコミット (`@cc-discord-framework/core@2.0.0` / 旧 `cc-discord-framework@1.0.5` など)
2. Bun、OS、discord.js と関連プラグインのバージョン
3. 最小の再現コードと再現手順
4. 期待した結果と実際の結果
5. エラーログ（Bot token、API key、ユーザー情報は必ず除去）

不具合か分からない質問も Issues で受け付けます。既存 Issue を検索してから、
[新しい Issue](https://github.com/CHACCHAN/cc-discord-framework/issues/new/choose)
を作成してください。

## 機密性のある脆弱性

未修正の脆弱性や再現用の秘密情報を、公開 Issue へ投稿しないでください。
非公開の報告窓口が整備されるまでは、この文書から安全な受付手段を案内できない
ため、架空の連絡先は掲載していません。窓口を有効化した時点で、
`SECURITY.md` と公式サイトへ対応バージョン・報告方法を掲載します。
