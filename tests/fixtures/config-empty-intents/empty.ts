import { defineConfig } from "../../../src/index.js";

// intents は「宣言されている」が空 — ゲートウェイ接続で初めて失敗する形。
export default defineConfig({ intents: [] });
