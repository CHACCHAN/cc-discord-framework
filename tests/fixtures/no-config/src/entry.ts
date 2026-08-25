/** 隣に config/ が無いエントリポイント。エラー文言を確かめるために使います。 */
import { createClient } from "../../../../src/index.js";

try {
	await createClient();
	console.log("NO_ERROR");
} catch (error) {
	console.log(JSON.stringify({ message: (error as Error).message }));
}
