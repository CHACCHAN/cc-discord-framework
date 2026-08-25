/**
 * 時間の解析と表示。
 *
 * Bot を書いていると「1時間ごと」「30秒後」「3:45」といった時間の
 * 読み書きが延々と出てきます。この3つだけで足ります。
 */
import { defaultTheme, type Theme } from "./theme.js";

/** ミリ秒、または `"90s"` `"1h30m"` `"2d"` のような期間表記。 */
export type DurationInput = number | string;

const UNIT_MS = {
	ms: 1,
	s: 1_000,
	m: 60_000,
	h: 3_600_000,
	d: 86_400_000,
	w: 604_800_000,
} as const;

// 単数の "m" より先に "ms" を試す必要があるため、この並び順は変えないこと。
const TERM = /(\d+(?:\.\d+)?)(ms|s|m|h|d|w)/g;
const ONLY_TERMS = /^(?:\d+(?:\.\d+)?(?:ms|s|m|h|d|w))+$/;
const ONLY_DIGITS = /^\d+(?:\.\d+)?$/;

/**
 * 期間をミリ秒へ変換します。数値はそのままミリ秒として扱われるため、
 * 期間を受け取るあらゆる API の入口に置けます。
 *
 * ```ts
 * parseDuration(500);      // 500
 * parseDuration("90s");    // 90000
 * parseDuration("1h30m");  // 5400000
 * parseDuration("1d 12h"); // 129600000 (空白は無視される)
 * ```
 *
 * @throws {TypeError} 解釈できない値を渡した場合。
 */
export function parseDuration(input: DurationInput): number {
	if (typeof input === "number") {
		if (!Number.isFinite(input) || input < 0) {
			throw new TypeError(`期間として不正な数値です: ${input}`);
		}
		return Math.round(input);
	}

	const compact = input.replace(/\s+/g, "").toLowerCase();
	if (ONLY_DIGITS.test(compact)) return Math.round(Number(compact));

	if (!ONLY_TERMS.test(compact)) {
		throw new TypeError(
			`期間として解釈できません: "${input}" — 例: 500, "90s", "1h30m", "2d"(単位は ms/s/m/h/d/w)`,
		);
	}

	let total = 0;
	for (const [, value, unit] of compact.matchAll(TERM)) {
		total += Number(value) * UNIT_MS[unit as keyof typeof UNIT_MS];
	}
	return Math.round(total);
}

export interface FormatDurationOptions {
	/** 分・秒を2桁に揃える文字。 @default `defaultTheme.duration.clock.pad`("0") */
	pad?: string;
	/** 時・分・秒の区切り。 @default `defaultTheme.duration.clock.separator`(":") */
	separator?: string;
	/** 1時間未満でも時を出す。 @default `defaultTheme.duration.clock.alwaysHours`(false) */
	alwaysHours?: boolean;
}

/**
 * 時計表記に整形します — 再生位置や残り時間の表示向け。
 *
 * 既定は `defaultTheme.duration.clock` です。**この関数はクライアントを
 * 知らないので `utils({ theme })` は効きません** — Bot 全体の設定を
 * 効かせたい場合は `this.services.ui.formatDuration()` を使ってください。
 *
 * ```ts
 * formatDuration(83_000);    // "1:23"
 * formatDuration(3_723_000); // "1:02:03"
 * ```
 */
export function formatDuration(ms: number, options: FormatDurationOptions = {}): string {
	const clock = { ...defaultTheme.duration.clock, ...options };
	const pad = clock.pad ?? "0";
	const separator = clock.separator ?? ":";
	const total = Math.max(0, Math.floor(ms / 1_000));
	const seconds = total % 60;
	const minutes = Math.floor(total / 60) % 60;
	const hours = Math.floor(total / 3_600);
	const padded = (value: number) => value.toString().padStart(2, pad);

	return hours > 0 || clock.alwaysHours
		? [hours, padded(minutes), padded(seconds)].join(separator)
		: [minutes, padded(seconds)].join(separator);
}

export interface HumanizeDurationOptions {
	/** 出す単位の数。 @default `defaultTheme.duration.max`(2) */
	max?: number;
	/** 単位の表記。日本語にするならここ。 @default `defaultTheme.duration.units` */
	units?: Partial<Theme["duration"]["units"]>;
	/** 単位のあいだに挟む文字列。 @default `defaultTheme.duration.separator`(" ") */
	separator?: string;
}

/**
 * 大まかな長さとして整形します — クールダウンや稼働時間の表示向け。
 * 時計表記と違い、既定では上位2単位だけを出すので長さがぶれません。
 *
 * ```ts
 * humanizeDuration(3_723_000);              // "1h 2m"
 * humanizeDuration(3_723_000, { max: 3 });  // "1h 2m 3s"
 * humanizeDuration(3_723_000, { units: { h: "時間", m: "分" }, separator: "" }); // "1時間2分"
 * ```
 *
 * 既定は `defaultTheme.duration` です。**この関数はクライアントを知らないので
 * `utils({ theme })` は効きません** — Bot 全体の設定を効かせたい場合は
 * `this.services.ui.humanize()` を使ってください。
 */
export function humanizeDuration(ms: number, options: HumanizeDurationOptions = {}): string {
	const units = { ...defaultTheme.duration.units, ...options.units };
	const separator = options.separator ?? defaultTheme.duration.separator;
	const max = Math.max(1, options.max ?? defaultTheme.duration.max);

	let rest = Math.max(0, Math.round(ms));
	const parts: string[] = [];

	for (const key of ["d", "h", "m", "s"] as const) {
		const size = UNIT_MS[key];
		const value = Math.floor(rest / size);
		if (value > 0) {
			parts.push(`${value}${units[key]}`);
			rest -= value * size;
			if (parts.length >= max) break;
		}
	}

	if (parts.length > 0) return parts.join(separator);
	return rest > 0 ? `${rest}${units.ms}` : `0${units.s}`;
}
