/**
 * リポジトリ内のプラグインとリファレンス Bot が、公開時と同じ
 * `import "cc-discord-framework"` でフレームワークを解決できるように、
 * node_modules へセルフリンクを張ります。
 *
 * ルートパッケージ自身は Bun のワークスペースメンバーになれないため、
 * `bun install` はこのリンクを作ってくれません。依存関係のインストール後に
 * `bun run link:self` を明示的に実行して補います。
 */
import { existsSync, lstatSync, symlinkSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";

const root = dirname(import.meta.dir);
const link = join(root, "node_modules", "cc-discord-framework");

if (!existsSync(join(root, "node_modules"))) {
	// bun install より前に呼ばれた場合は何もしない。
	process.exit(0);
}

if (existsSync(link) || lstatSyncSafe(link)) {
	const stat = lstatSyncSafe(link);
	if (stat?.isSymbolicLink()) unlinkSync(link);
	else if (stat) process.exit(0); // 実体がある場合は触らない
}

symlinkSync("..", link, "dir");
console.log("linked node_modules/cc-discord-framework -> .");

function lstatSyncSafe(path: string) {
	try {
		return lstatSync(path);
	} catch {
		return null;
	}
}
