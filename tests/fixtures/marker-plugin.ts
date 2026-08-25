/**
 * インストールされた順に名前を記録するだけのプラグイン。設定ディレクトリの
 * 読み込み順(= plugins の連結順)を観測するために使います。
 */
import { definePlugin, type Plugin } from "../../src/index.js";

/** install された順に名前が積まれます。テスト側で長さ 0 に戻してください。 */
export const installed: string[] = [];

export function markerPlugin(name: string): Plugin {
	return definePlugin({
		name,
		install() {
			installed.push(name);
		},
	});
}
