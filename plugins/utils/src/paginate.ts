/**
 * ボタンによるページ送り。
 */
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	type BaseMessageOptions,
	type Message,
} from "@cc-discord-framework/core";
import { parseDuration, type DurationInput } from "./duration.js";
import { invokerId, sendReply, type ReplyTarget } from "./reply.js";
import {
	applyButtonTheme,
	buttonTheme,
	resolveTheme,
	themeOf,
	type ButtonTheme,
	type Theme,
	type ThemeOptions,
} from "./theme.js";

/** 1ページ分の内容。文字列・埋め込み・そのままの送信ペイロード。 */
export type Page = string | EmbedBuilder | Omit<BaseMessageOptions, "components">;

/** ページ送りボタンの見た目の上書き。文字列ならラベルだけの変更。 */
export interface PaginationButtons {
	first?: string | Partial<ButtonTheme>;
	prev?: string | Partial<ButtonTheme>;
	next?: string | Partial<ButtonTheme>;
	last?: string | Partial<ButtonTheme>;
}

export interface PaginationLook {
	/** ボタンの見た目。 @default テーマの `pagination` */
	buttons?: PaginationButtons;
	/** 中央の現在位置表示。 @default テーマの `pagination.counter` */
	counter?: (current: number, total: number) => string;
	/** 中央の現在位置ボタンの色。 @default テーマの `pagination.counterStyle` */
	counterStyle?: ButtonStyle;
	/** 現在位置ボタンを出す。 @default テーマの `pagination.showCounter`(true) */
	showCounter?: boolean;
	/** この呼び出しだけテーマを上書きする。 */
	theme?: ThemeOptions;
}

export interface PaginateOptions extends PaginationLook {
	/** 表示するページ。`chunk()` と組み合わせると配列から簡単に作れます。 */
	pages: readonly Page[];
	/** 無操作でこの時間が過ぎるとボタンを無効化します。 @default テーマの `pagination.timeout`("2m") */
	timeout?: DurationInput;
	/** 最初に表示するページ(1 始まり)。 @default 1 */
	startPage?: number;
	/** 押せるユーザー。 @default 呼び出したユーザー */
	userId?: string;
	/** 誰でも押せるようにする。 @default false */
	anyone?: boolean;
	/** 本人にだけ見える返信にする(インタラクションのみ)。 @default false */
	ephemeral?: boolean;
}

export interface PaginationRowOptions extends PaginationLook {
	/** すべてのボタンを無効化する(終了時)。 */
	disabled?: boolean;
	/**
	 * テーマの取得元。インタラクションやメッセージを渡すと、その
	 * クライアントの `utils({ theme })` が効きます。省略すると既定のテーマです。
	 */
	target?: ReplyTarget;
	/** @internal 解決済みのテーマ。`target` / `theme` より優先されます。 */
	resolved?: Theme;
}

/**
 * ページ送りのボタン列を作ります。端では自動的に無効化されます。
 * コレクターを自分で書きたい場合はこれだけ使ってください。
 *
 * 見た目は `options` → `target` のクライアントのテーマ → 既定テーマ の順で
 * 決まります。**`target` を渡さないと `utils({ theme })` は効きません**
 * (この関数だけではどのクライアントの呼び出しか分からないため)。
 *
 * ```ts
 * paginationRow(page, pages, "myprefix", { target: interaction });
 * ```
 */
export function paginationRow(
	current: number,
	total: number,
	idPrefix: string,
	options: PaginationRowOptions = {},
): ActionRowBuilder<ButtonBuilder> {
	// 呼び出しごとの上書きは、クライアントのテーマの「上へ」重ねる。
	const theme = options.resolved ?? resolveTheme(options.theme, themeOf(options.target));
	const look = theme.pagination;
	const off = options.disabled ?? false;
	const atStart = off || current <= 1;
	const atEnd = off || current >= total;

	const button = (action: string, base: ButtonTheme, disabled: boolean) =>
		applyButtonTheme(
			new ButtonBuilder().setCustomId(`${idPrefix}:${action}`).setDisabled(disabled),
			buttonTheme(base, options.buttons?.[action as keyof PaginationButtons]),
		);

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		button("first", look.first, atStart),
		button("prev", look.prev, atStart),
	);

	if (options.showCounter ?? look.showCounter) {
		row.addComponents(
			new ButtonBuilder()
				.setCustomId(`${idPrefix}:page`)
				.setLabel((options.counter ?? look.counter)(current, total))
				.setStyle(options.counterStyle ?? look.counterStyle)
				.setDisabled(true),
		);
	}

	return row.addComponents(button("next", look.next, atEnd), button("last", look.last, atEnd));
}

function render(page: Page): BaseMessageOptions {
	// 前のページの内容が残らないよう、常に両方を明示する。
	if (typeof page === "string") return { content: page, embeds: [] };
	if (page instanceof EmbedBuilder) return { content: "", embeds: [page] };
	const { content, embeds, ...options } = page;
	return { ...options, content: content ?? "", embeds: embeds ?? [] };
}

/**
 * ページ送り付きのメッセージを送ります。ページが1つだけならボタンは
 * 付きません。
 *
 * 戻り値は送信直後のメッセージで、ページ送り自体はそのあとバック
 * グラウンドで動き続けます(無操作のまま `timeout` が過ぎるとボタンを
 * 無効化して終了)。
 *
 * ```ts
 * const pages = chunk(members, 10).map((page, index) =>
 *   this.services.ui.info(page.join("\n")).setTitle(`メンバー(${index + 1}ページ目)`),
 * );
 * await paginate(interaction, { pages });
 * ```
 */
export async function paginate(target: ReplyTarget, options: PaginateOptions): Promise<Message> {
	const pages = options.pages;
	if (pages.length === 0) throw new RangeError("paginate には最低1ページ必要です");

	// 呼び出しごとの上書きは、クライアントのテーマの「上へ」重ねる。
	const theme = resolveTheme(options.theme, themeOf(target));
	const id = crypto.randomUUID().slice(0, 8);
	let current = Math.min(Math.max(1, Math.floor(options.startPage ?? 1)), pages.length);
	const body = () => render(pages[current - 1] as Page);
	const row = (disabled?: boolean) =>
		paginationRow(current, pages.length, id, { ...options, resolved: theme, disabled });

	if (pages.length === 1) {
		const single = await sendReply(target, body(), { ephemeral: options.ephemeral });
		return single.message;
	}

	const reply = await sendReply(
		target,
		{ ...body(), components: [row()] },
		{ ephemeral: options.ephemeral },
	);

	const allowed = options.anyone ? null : (options.userId ?? invokerId(target));
	const collector = reply.message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		idle: parseDuration(options.timeout ?? theme.pagination.timeout),
		filter: (interaction) =>
			interaction.customId.startsWith(`${id}:`) &&
			(allowed === null || interaction.user.id === allowed),
	});

	collector.on("collect", async (button) => {
		switch (button.customId.slice(id.length + 1)) {
			case "first":
				current = 1;
				break;
			case "prev":
				current = Math.max(1, current - 1);
				break;
			case "next":
				current = Math.min(pages.length, current + 1);
				break;
			case "last":
				current = pages.length;
				break;
			default:
				return;
		}
		await button.update({ ...body(), components: [row()] }).catch(() => undefined);
	});

	collector.on("end", () => {
		void reply.edit({ ...body(), components: [row(true)] }).catch(() => undefined);
	});

	return reply.message;
}
