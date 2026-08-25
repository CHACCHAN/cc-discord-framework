import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * ディレクトリ配下から「モジュールとして読み込むファイル」を集めます。
 *
 * フレームワークのディレクトリ規約(コンポーネント自動探索と設定
 * ディレクトリ)はどちらもこの規則の上に成り立っています。プラグインが
 * 独自のディレクトリを走査するときも、同じ規則をそのまま使えます。
 *
 * - `**\/*.{ts,tsx,js,jsx}` を再帰的に走査(サブディレクトリも対象)
 * - パスの途中を含め、`_` で始まるファイル・ディレクトリはスキップ
 * - 型定義(`*.d.ts`)とテスト(`*.test.*` / `*.spec.*`)はスキップ
 * - 結果はパスの昇順にソート(ロード順を決定的にするため)
 *
 * ディレクトリが存在しない場合は空配列を返します — 使っていない規約
 * ディレクトリを作らずに済ませるためです。
 */
export async function collectModuleFiles(directory: string): Promise<string[]> {
	if (!existsSync(directory)) return [];

	// サブディレクトリも走査する。増えてきたら束ねて整理できるように
	// (`commands/music/` や `config/plugins/` のように)。
	const glob = new Bun.Glob("**/*.{ts,tsx,js,jsx}");
	const paths: string[] = [];
	for await (const relative of glob.scan({ cwd: directory })) {
		const segments = relative.split(/[/\\]/);
		// "_" で始まるファイル・ディレクトリは共有コード扱いでスキップする。
		if (segments.some((segment) => segment.startsWith("_"))) continue;
		const file = segments[segments.length - 1] ?? "";
		if (file.endsWith(".d.ts")) continue;
		if (/\.(test|spec)\.[tj]sx?$/.test(file)) continue;
		paths.push(join(directory, relative));
	}
	paths.sort();

	return paths;
}
