---
sidebar_position: 5
title: プロジェクト状況
description: 公開中の v2(@cc-discord-framework/core)と旧 npm v1 の違い、保守者、サポート方針を確認できます。
---

# プロジェクト状況

最終更新: **2026-08-25**

このサイトは、npm で公開中の **v2**(`@cc-discord-framework/core`)を
説明しています。旧世代のスコープなしパッケージとは別物なので、導入前に
次の違いを確認してください。

| 確認項目 | 現在 | 注意 |
| --- | --- | --- |
| このサイトと `main` のコード | **v2 — 公開中** | [`@cc-discord-framework/core@2.0.0`](https://www.npmjs.com/package/@cc-discord-framework/core)(2026-08-25 公開)。公式プラグインも同じ [`@cc-discord-framework`](https://www.npmjs.com/org/cc-discord-framework) スコープで公開 |
| 旧パッケージ `cc-discord-framework` | **v1.0.5 — legacy**（2026-05-10 公開） | 既存の v1 利用者向け。v2 とは API 非互換で、今後の開発は `@cc-discord-framework` スコープで行われます |
| Runtime | **Bun 1.4+** | Node.js はサポート対象外 |
| Maintainer | **CHACCHAN** | 個人メンテナンスの OSS |
| この情報の更新日 | **2026-08-25** | 状況が変わったときにこのページを更新 |

v2 の導入コマンドは[インストール](./getting-started/installation.md)に
まとめています。v1.0.5 の公開内容は
[GitHub Release](https://github.com/CHACCHAN/cc-discord-framework/releases/tag/v1.0.5)
で確認できます。

## Maintained by CHACCHAN

熊の耳にした2つの C は **CHACCHAN** から。CHACCHAN が設計・実装・
ドキュメントを保守する個人メンテナンスの OSS です。公開コードと運用
リファレンス Bot を基準に改善しています。

- [CHACCHAN の GitHub プロフィール](https://github.com/CHACCHAN)
- [リポジトリ](https://github.com/CHACCHAN/cc-discord-framework)
- [main の更新履歴](https://github.com/CHACCHAN/cc-discord-framework/commits/main)

## 困ったとき・状況を追うとき

- [サポート方針](https://github.com/CHACCHAN/cc-discord-framework/blob/main/SUPPORT.md) — 質問・不具合と、脆弱性報告に関する案内
- [Issues](https://github.com/CHACCHAN/cc-discord-framework/issues) — 不具合の報告と既知の課題
- [MIT License](https://github.com/CHACCHAN/cc-discord-framework/blob/main/LICENSE) — 利用条件
- [ブログ](/blog/) — このサイトで公開する更新情報と技術記事

長期サポート（LTS）の期限と回答時間の SLA は、現在設定されていません。
利用を判断するときは、公開コード、更新履歴、Issues とサポート方針を確認してください。
