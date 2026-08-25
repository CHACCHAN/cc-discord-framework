import { defineConfig } from "../../../src/index.js";

// intents をどのファイルも宣言していない設定ディレクトリ。
export default defineConfig({
	defaultPrefix: "!",
	logger: { level: "silent" },
});
