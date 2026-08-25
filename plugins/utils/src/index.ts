/**
 * 公式 utils プラグイン — 小さな便利機能の詰め合わせ。
 *
 * どれもコアに入れるほど普遍的ではないけれど、Bot を書けばだいたい
 * 毎回書くことになるものです。専用パッケージを作るには小さすぎるので、
 * ここへまとめています。
 *
 * ```ts
 * import { utils } from "@cc-discord-framework/utils";
 *
 * const client = new Client({
 *   intents: [GatewayIntentBits.Guilds],
 *   plugins: [utils({ theme: { colors: { success: 0x00ffaa } } })],
 * });
 * ```
 *
 * # 中身
 *
 * | 種類 | 内容 |
 * | --- | --- |
 * | コンポーネント種別 | {@link Task}(`tasks/` — 定期実行) |
 * | サービス | `this.services.ui` — テーマ済みの埋め込みと UI |
 * | UI | {@link confirm}・{@link paginate} |
 * | 整形 | {@link formatDuration}・{@link humanizeDuration}・{@link parseDuration} |
 * | 文字列 / 配列 | {@link truncate}・{@link chunk}・{@link splitMessage}・{@link progressBar} |
 *
 * # 見た目はすべて差し替えられます
 *
 * 色・ラベル・記号・既定の待ち時間は {@link Theme} に集約されています。
 * `utils({ theme })` で Bot 全体の既定を決め、各呼び出しの `options` で
 * その場だけ上書きできます。ハードコードされて変えられない見た目は
 * ありません。
 */
import { definePlugin, type Plugin } from "cc-discord-framework";
import { resolveTheme, type ThemeOptions } from "./theme.js";
import { TaskStore } from "./scheduler.js";
import { UiService } from "./UiService.js";

export interface UtilsOptions {
	/**
	 * `tasks/` の自動ロードと定期実行を有効にする。
	 * @default true
	 */
	scheduler?: boolean;
	/**
	 * `this.services.ui` を登録する。
	 * @default true
	 */
	ui?: boolean;
	/**
	 * Bot 全体の見た目。指定した項目だけが既定値を上書きします。
	 * @default {@link defaultTheme}
	 */
	theme?: ThemeOptions;
}

/**
 * utils プラグインをインストールします。
 *
 * テーマはクライアントの `container.theme` に置かれるので、複数
 * クライアントを立てても設定は混ざりません。追加されるコンポーネント
 * 種別は有効にしても対応するディレクトリが無ければ何も起きません —
 * `tasks/` を作った時点で動き出します。
 */
export function utils(options: UtilsOptions = {}): Plugin {
	return definePlugin({
		name: "utils",
		install(client) {
			// クライアント毎に持たせることで、複数クライアントでもテーマが混ざらない。
			client.container.theme = resolveTheme(options.theme);

			if (options.scheduler ?? true) client.stores.register(new TaskStore());
			if (options.ui ?? true) client.register(UiService);
		},
	});
}

// ---- 公開 API ----------------------------------------------------------

// テーマ(見た目の一元管理)
export {
	applyButtonTheme,
	buttonTheme,
	defaultTheme,
	resolveTheme,
	themeOf,
	type ButtonTheme,
	type ColorTheme,
	type Theme,
	type ThemeOptions,
} from "./theme.js";

// 定期実行
export { Task, TaskStore, type TaskOptions } from "./scheduler.js";

// UI
export { UiService } from "./UiService.js";
export { createEmbeds, type Embeds } from "./embeds.js";
export { confirm, type ConfirmOptions } from "./confirm.js";
export {
	paginate,
	paginationRow,
	type Page,
	type PaginateOptions,
	type PaginationButtons,
	type PaginationLook,
	type PaginationRowOptions,
} from "./paginate.js";
export { invokerId, sendReply, type ReplyTarget, type SentReply } from "./reply.js";

// 整形
export {
	formatDuration,
	humanizeDuration,
	parseDuration,
	type DurationInput,
	type FormatDurationOptions,
	type HumanizeDurationOptions,
} from "./duration.js";
export {
	chunk,
	progressBar,
	splitMessage,
	truncate,
	EMBED_DESCRIPTION_LIMIT,
	MESSAGE_LIMIT,
	type ProgressBarOptions,
	type SplitMessageOptions,
} from "./text.js";

declare module "cc-discord-framework" {
	interface Stores {
		tasks: TaskStore;
	}
}
