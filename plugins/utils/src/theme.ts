/**
 * 見た目の既定値をまとめたテーマ。
 *
 * このパッケージのヘルパーが使う色・ラベル・記号・既定の待ち時間は
 * **すべてここに集約されていて、すべて差し替えられます**。
 * ハードコードされていて変えられない見た目は存在しません。
 *
 * 差し替えの入口は3段階あり、**下のものほど優先され、上を「消さずに重なります」**:
 *
 * 1. {@link defaultTheme} — 何もしないときの値
 * 2. `utils({ theme })` — Bot 全体の既定(クライアント毎に保持されます)
 * 3. 各呼び出しの `options` — その場限りの上書き
 *
 * 3段目で1項目だけ指定しても2段目の設定は残ります(置き換えではなく重ね合わせ)。
 *
 * ただし {@link progressBar} などの **素の関数はクライアントを知らない** ため、
 * 2段目を飛ばして `defaultTheme` を既定に使います。Bot 全体のテーマを
 * 効かせたい場合は `this.services.ui` 経由で呼んでください。
 */
import { ButtonStyle, type ButtonBuilder } from "cc-discord-framework";
import type { DurationInput, FormatDurationOptions } from "./duration.js";

/** ボタン1つ分の見た目。`label` と `emoji` は少なくとも一方が必要です。 */
export interface ButtonTheme {
	label?: string;
	emoji?: string;
	style: ButtonStyle;
}

/** 用途ごとの埋め込み色。 */
export interface ColorTheme {
	success: number;
	error: number;
	warning: number;
	info: number;
}

export interface Theme {
	colors: ColorTheme;
	confirm: {
		yes: ButtonTheme;
		no: ButtonTheme;
		/** 応答を待つ時間。 */
		timeout: DurationInput;
	};
	pagination: {
		first: ButtonTheme;
		prev: ButtonTheme;
		next: ButtonTheme;
		last: ButtonTheme;
		/** 中央に出す現在位置の文字列。 */
		counter: (current: number, total: number) => string;
		counterStyle: ButtonStyle;
		/** 現在位置のボタンを出すか。 */
		showCounter: boolean;
		/** 無操作でボタンを無効化するまでの時間。 */
		timeout: DurationInput;
	};
	progress: {
		filled: string;
		empty: string;
		width: number;
	};
	duration: {
		/** `humanizeDuration` が使う単位。日本語にするならここ。 */
		units: { d: string; h: string; m: string; s: string; ms: string };
		/** 単位のあいだに挟む文字列。 */
		separator: string;
		/** 既定で出す単位の数。 */
		max: number;
		/** `formatDuration` の時計表記(区切り・ゼロ埋め)。 */
		clock: FormatDurationOptions;
	};
	text: {
		/** `truncate` が末尾に付ける文字列。 */
		ellipsis: string;
	};
}

/** {@link Theme} の部分指定。指定しなかった項目は既定値のままになります。 */
export type ThemeOptions = DeepPartial<Theme>;

type DeepPartial<T> = T extends (...args: never[]) => unknown
	? T
	: T extends object
		? { [K in keyof T]?: DeepPartial<T[K]> }
		: T;

/**
 * 何も指定しないときの見た目。丸ごと差し替えるより、必要な項目だけを
 * `utils({ theme: { colors: { success: 0x00ffaa } } })` のように
 * 上書きするほうが安全です。
 */
export const defaultTheme: Theme = {
	colors: {
		success: 0x57f287,
		error: 0xed4245,
		warning: 0xfee75c,
		info: 0x5865f2,
	},
	confirm: {
		yes: { label: "決定", style: ButtonStyle.Success },
		no: { label: "中止", style: ButtonStyle.Danger },
		timeout: "1m",
	},
	pagination: {
		first: { label: "《", style: ButtonStyle.Secondary },
		prev: { label: "‹", style: ButtonStyle.Primary },
		next: { label: "›", style: ButtonStyle.Primary },
		last: { label: "》", style: ButtonStyle.Secondary },
		counter: (current, total) => `${current} / ${total}`,
		counterStyle: ButtonStyle.Secondary,
		showCounter: true,
		timeout: "2m",
	},
	progress: {
		filled: "█",
		empty: "░",
		width: 20,
	},
	duration: {
		units: { d: "d", h: "h", m: "m", s: "s", ms: "ms" },
		separator: " ",
		max: 2,
		clock: {},
	},
	text: {
		ellipsis: "…",
	},
};

/**
 * 部分指定を重ねて、完全なテーマにします。
 *
 * `base` を渡すとその上へ重ねます。呼び出しごとの上書きが Bot 全体の
 * テーマを消してしまわないよう、`confirm()` などは
 * `resolveTheme(options.theme, themeOf(target))` の形で使います。
 */
export function resolveTheme(options: ThemeOptions = {}, base: Theme = defaultTheme): Theme {
	return {
		colors: { ...base.colors, ...options.colors },
		confirm: {
			yes: { ...base.confirm.yes, ...options.confirm?.yes },
			no: { ...base.confirm.no, ...options.confirm?.no },
			timeout: options.confirm?.timeout ?? base.confirm.timeout,
		},
		pagination: {
			first: { ...base.pagination.first, ...options.pagination?.first },
			prev: { ...base.pagination.prev, ...options.pagination?.prev },
			next: { ...base.pagination.next, ...options.pagination?.next },
			last: { ...base.pagination.last, ...options.pagination?.last },
			counter: options.pagination?.counter ?? base.pagination.counter,
			counterStyle: options.pagination?.counterStyle ?? base.pagination.counterStyle,
			showCounter: options.pagination?.showCounter ?? base.pagination.showCounter,
			timeout: options.pagination?.timeout ?? base.pagination.timeout,
		},
		progress: { ...base.progress, ...options.progress },
		duration: {
			units: { ...base.duration.units, ...options.duration?.units },
			separator: options.duration?.separator ?? base.duration.separator,
			max: options.duration?.max ?? base.duration.max,
			clock: { ...base.duration.clock, ...options.duration?.clock },
		},
		text: { ...base.text, ...options.text },
	};
}

/**
 * そのクライアントに設定されたテーマを取り出します。`utils()` を
 * 入れていない場合や、クライアント以外から呼ばれた場合は既定値です。
 *
 * これがあるおかげで、`confirm()` や `paginate()` は「どのクライアントの
 * 呼び出しか」をインタラクション経由で自分で判断でき、利用者が毎回
 * テーマを渡す必要がありません。
 */
export function themeOf(source: { client?: unknown } | null | undefined): Theme {
	const container = (source?.client as { container?: { theme?: Theme } } | undefined)?.container;
	return container?.theme ?? defaultTheme;
}

/**
 * ボタンの見た目に部分指定を重ねます。文字列を渡すとラベルだけの
 * 変更になります(`yes: "はい"` のような短い書き方のため)。
 *
 * 既定のラベルを消して **絵文字だけのボタン** にしたい場合は、
 * `label` を明示的に `undefined` にしてください:
 *
 * ```ts
 * { yes: { label: undefined, emoji: "✅" } }
 * ```
 */
export function buttonTheme(
	base: ButtonTheme,
	override?: string | Partial<ButtonTheme>,
): ButtonTheme {
	if (override === undefined) return base;
	if (typeof override === "string") return { ...base, label: override };
	return { ...base, ...override };
}

/** ボタンの見た目をビルダーへ適用します。 */
export function applyButtonTheme(button: ButtonBuilder, theme: ButtonTheme): ButtonBuilder {
	if (theme.label === undefined && theme.emoji === undefined) {
		throw new TypeError("ボタンには label か emoji のどちらかが必要です");
	}
	button.setStyle(theme.style);
	if (theme.label !== undefined) button.setLabel(theme.label);
	if (theme.emoji !== undefined) button.setEmoji(theme.emoji);
	return button;
}

declare module "cc-discord-framework" {
	interface Container {
		/** `utils()` が解決して置くテーマ。クライアント毎に独立しています。 */
		theme: Theme;
	}
}
