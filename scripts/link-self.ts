/**
 * リポジトリ内のプラグインとリファレンス Bot が、公開時と同じ
 * `import "@cc-discord-framework/core"` でフレームワークを解決できるように、
 * node_modules へセルフリンクを張ります。
 *
 * ルートパッケージ自身は Bun のワークスペースメンバーになれないため、
 * `bun install` はこのリンクを作ってくれません。依存関係のインストール後に
 * `bun run link:self` を明示的に実行して補います。
 */
import { existsSync, lstatSync, mkdirSync, rmSync, symlinkSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";

const root = dirname(import.meta.dir);
const scopeDir = join(root, "node_modules", "@cc-discord-framework");
const link = join(scopeDir, "core");

if (!existsSync(join(root, "node_modules"))) {
	// bun install より前に呼ばれた場合は何もしない。
	process.exit(0);
}

// ワークスペースのプラグインが未インストールでもスコープディレクトリは作る。
mkdirSync(scopeDir, { recursive: true });

// bun install は公開済みのレジストリ版 @cc-discord-framework/core を
// この位置に実体として展開します。リポジトリ内のコードは常に手元の
// src/ に対して動くべきなので、シンボリックリンク・実体のどちらでも
// 取り除いてからセルフリンクに張り替えます。
const stat = lstatSyncSafe(link);
if (stat?.isSymbolicLink()) unlinkSync(link);
else if (stat) rmSync(link, { recursive: true, force: true });

// リンクの置き場所は node_modules/@cc-discord-framework/ の中なので、
// リポジトリルートへは2階層戻る。
symlinkSync(join("..", ".."), link, "dir");
console.log("linked node_modules/@cc-discord-framework/core -> .");

function lstatSyncSafe(path: string) {
	try {
		return lstatSync(path);
	} catch {
		return null;
	}
}
