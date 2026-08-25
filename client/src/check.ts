/** オフライン起動チェック: Discord に接続せず全コンポーネントをロードします。 */
import client from "./index.js";

await client.load();

for (const store of client.stores) {
	console.log(`${store.name}: ${[...store.keys()].join(", ") || "(なし)"}`);
}

await client.destroy();
