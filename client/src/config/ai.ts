/**
 * AI — `this.services.ai` と、`src/ai/` に置いた AiTool の自動ロード。
 *
 * モデルは環境変数から取るので、未設定でも Bot は問題なく起動します
 * (その場合 AI コマンドだけが「モデルを設定してください」と答え、
 * 他の機能には影響しません)。
 *
 * `priority` を書いていないので既定の 0 — utils(100)・music(50)より後に
 * インストールされます。`src/ai/` のツールは `this.services.audio` を
 * 参照するので、依存の向きに合わせて後ろに置いています。
 */
import { defineConfig } from "cc-discord-framework";
import { ai } from "@cc-discord-framework/ai";
import { env } from "./_env.js";

export default defineConfig({
	plugins: [
		ai({
			model: env.aiModel,
			// src/ai/ のツールをモデルへ渡すか。**function calling に対応して
			// いないモデルにツールを渡すと、エラーも出さずに空の応答が返る**
			// (実測: 対応していないエンドポイントでは 3/3 で空、外すと 3/3 で成功)。
			// 対応していないモデルを使うときは .env に AI_TOOLS=off を書く。
			tools: { enabled: env.aiTools },
			// OpenAI 互換エンドポイント(Open WebUI)。apiKey は
			// Authorization: Bearer として送られる — 認証を掛けている
			// エンドポイントでは必須で、無いと 401 になる。
			providers: {
				compatible: {
					name: "openwebui",
					// _env.ts は「未設定」を null に寄せているが、プラグインの
					// 接続設定は省略可能な項目なので undefined に戻す。
					baseURL: env.aiBaseUrl ?? undefined,
					apiKey: env.aiToken ?? undefined,
				},
			},
		}),
	],
});
