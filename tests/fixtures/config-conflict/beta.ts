import { defineConfig } from "../../../src/index.js";

// alpha.ts と同じキーに違う値 — ローダーは衝突として弾く。
export default defineConfig({
	defaultPrefix: "?",
});
