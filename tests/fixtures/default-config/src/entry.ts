/**
 * 既定の設定ディレクトリ解決を **実際のエントリポイントとして** 確かめる
 * ための小さな Bot。`Bun.main` に依存する挙動なので、別プロセスで走らせて
 * 標準出力を検証します。
 */
import { createClient } from "../../../../src/index.js";

const client = await createClient(undefined, { logger: { level: "silent" } });

console.log(
	JSON.stringify({
		baseDirectory: client.baseDirectory,
		intents: client.options.intents.bitfield.toString(),
	}),
);

await client.destroy();
