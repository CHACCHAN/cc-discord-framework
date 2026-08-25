import { defineConfig } from "../../../src/index.js";

// default export がない — ローダーはこのファイル名を挙げて失敗する。
export const config = defineConfig({ intents: [] });
