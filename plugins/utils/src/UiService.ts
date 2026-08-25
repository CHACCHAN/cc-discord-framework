/**
 * テーマを適用済みの UI 入口。
 *
 * `confirm()` や `paginate()` はインタラクション経由でテーマを自分で
 * 見つけられますが、埋め込みや進捗バーには手がかりがありません。
 * このサービスがあれば、コンポーネントの中では常に
 * `this.services.ui` と書くだけで Bot 全体のテーマが効きます。
 */
import { Service, type EmbedBuilder, type Message } from "cc-discord-framework";
import { confirm, type ConfirmOptions } from "./confirm.js";
import { createEmbeds, type Embeds } from "./embeds.js";
import {
	formatDuration,
	humanizeDuration,
	type FormatDurationOptions,
	type HumanizeDurationOptions,
} from "./duration.js";
import { paginate, type PaginateOptions } from "./paginate.js";
import { progressBar, truncate, type ProgressBarOptions } from "./text.js";
import type { ReplyTarget } from "./reply.js";
import type { ColorTheme, Theme } from "./theme.js";

/**
 * `this.services.ui` — テーマ済みの埋め込みと UI ヘルパー。
 *
 * ```ts
 * await interaction.reply({ embeds: [this.services.ui.success("保存しました。")] });
 * if (!(await this.services.ui.confirm(interaction, { content: "削除しますか?" }))) return;
 * ```
 */
@Service.define()
export class UiService extends Service {
	#embeds: Embeds | null = null;

	/** このクライアントのテーマ。 */
	public get theme(): Theme {
		return this.container.theme;
	}

	/** テーマの色。 */
	public get colors(): ColorTheme {
		return this.theme.colors;
	}

	/** 成功(テーマの色)。 */
	public success(description?: string): EmbedBuilder {
		return this.embeds.success(description);
	}

	/** 失敗(テーマの色)。`Error` をそのまま渡せます。 */
	public error(description?: string | Error): EmbedBuilder {
		return this.embeds.error(description);
	}

	/** 警告(テーマの色)。 */
	public warning(description?: string): EmbedBuilder {
		return this.embeds.warning(description);
	}

	/** 情報(テーマの色)。 */
	public info(description?: string): EmbedBuilder {
		return this.embeds.info(description);
	}

	/** 任意の色。テーマの色名か色コードを渡します。 */
	public of(color: keyof ColorTheme | number, description?: string | Error): EmbedBuilder {
		return this.embeds.of(color, description);
	}

	/** 確認ダイアログ。テーマのラベル・色・待ち時間が既定になります。 */
	public confirm(target: ReplyTarget, options: ConfirmOptions = {}): Promise<boolean> {
		return confirm(target, options);
	}

	/** ページ送り。テーマのボタン・待ち時間が既定になります。 */
	public paginate(target: ReplyTarget, options: PaginateOptions): Promise<Message> {
		return paginate(target, options);
	}

	/** 進捗バー。テーマの文字と幅が既定になります。 */
	public progressBar(value: number, total: number, options: ProgressBarOptions = {}): string {
		return progressBar(value, total, { ...this.theme.progress, ...options });
	}

	/** 大まかな長さ。テーマの単位・区切り・単位数が既定になります。 */
	public humanize(ms: number, options: HumanizeDurationOptions = {}): string {
		return humanizeDuration(ms, { ...this.theme.duration, ...options });
	}

	/** 時計表記。テーマの区切り・ゼロ埋めが既定になります。 */
	public formatDuration(ms: number, options: FormatDurationOptions = {}): string {
		return formatDuration(ms, { ...this.theme.duration.clock, ...options });
	}

	/** 文字列の切り詰め。テーマの省略記号が既定になります。 */
	public truncate(text: string, max: number, suffix = this.theme.text.ellipsis): string {
		return truncate(text, max, suffix);
	}

	get embeds(): Embeds {
		this.#embeds ??= createEmbeds(this.theme);
		return this.#embeds;
	}
}

declare module "cc-discord-framework" {
	interface Services {
		ui: UiService;
	}
}
