import type { Awaitable } from "discord.js";
import type { Client } from "./client.js";

/**
 * フレームワークプラグイン。
 *
 * `install` は {@link Client.load} の冒頭 — どのコンポーネントよりも先 —
 * に実行されるため、プラグインは次のことができます:
 *
 * - 新しいコンポーネント種別の登録: `client.stores.register(new TaskStore())`
 * - サービスの提供: `client.container.x = ...`(`Container` の宣言マージと併用)
 * - コンポーネントの同梱: `client.register(MyCommand, MyListener)`
 * - クライアント / フレームワークイベントによるランタイム観測
 *
 * プラグインは配列順にインストールされ、async でも構いません
 * (データベース接続、設定読み込みなど)。
 */
export interface Plugin {
	/** ログで使われる一意なプラグイン名。 */
	readonly name: string;
	/** クライアント起動時に一度だけ、コンポーネントのロード前に呼ばれます。 */
	install(client: Client): Awaitable<unknown>;
}

/**
 * プラグインオブジェクトを型付けする恒等ヘルパー。設定可能なプラグインは
 * `definePlugin({...})` を返すファクトリ関数として書くのが慣例です:
 *
 * ```ts
 * export function scheduler(options: SchedulerOptions = {}) {
 *   return definePlugin({
 *     name: "scheduler",
 *     install(client) { ... },
 *   });
 * }
 * ```
 */
export function definePlugin<T extends Plugin>(plugin: T): T {
	return plugin;
}
