# API リファレンス

cc-discord-framework と公式プラグインの **公開 API リファレンス** です。
各パッケージの `src/index.ts` から export されているシンボル(= Public API)だけを掲載しています。ここに載っていないものは内部実装であり、将来予告なく変更されます。

このリファレンスはソースコードの JSDoc から [TypeDoc](https://typedoc.org/) で自動生成されています(`bun run --cwd website api:generate` で再生成)。

## discord.js の再エクスポートについて

`cc-discord-framework` は `export * from "discord.js"` により **discord.js の全 API をそのまま再エクスポート** しています。Bot 側は `cc-discord-framework` だけを import すれば、`GatewayIntentBits` / `Events` / `EmbedBuilder` などの discord.js の API もすべて利用できます。

ただし、このリファレンスには **このリポジトリで宣言されたシンボルのみ** を掲載しています。discord.js 由来の API については [discord.js 公式ドキュメント](https://discord.js.org/docs) を参照してください(例外として `Client` / `ClientOptions` / `Component` は、フレームワークが discord.js の同名 API を意図的に上書きしているため、こちらに掲載されています)。

## パッケージ一覧

| パッケージ | 内容 |
| --- | --- |
| `cc-discord-framework` | フレームワーク本体(クライアント・コンポーネントモデル・コマンド・リスナー・Precondition・サービス・プラグイン機構) |
| `@cc-discord-framework/utils` | 小さな便利機能の詰め合わせ(定期実行・埋め込み・ページネーション・確認 UI・整形) |
| `@cc-discord-framework/music` | 音楽再生エンジン(キュー・再生制御・差し替え可能なプロバイダー) |
| `@cc-discord-framework/music-sources` | music プラグイン向けの音源(YouTube・SoundCloud) |
| `@cc-discord-framework/ai` | AI 連携(Vercel AI SDK・複数プロバイダー・ツール呼び出し・ストリーミング応答) |
