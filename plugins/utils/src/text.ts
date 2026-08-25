/**
 * 文字列と配列の小道具。
 *
 * discord.js が既に持っているもの(`codeBlock`・`bold`・`escapeMarkdown`・
 * `time` など)は `cc-discord-framework` から直接使えるので、ここには
 * 置いていません。Discord の制限に起因するものだけを扱います。
 */
import { defaultTheme } from "./theme.js";

// Discord 側の仕様で決まっている値(変更する意味がないもの)。
/** Discord のメッセージ本文の上限。 */
export const MESSAGE_LIMIT = 2_000;
/** 埋め込みの description の上限。 */
export const EMBED_DESCRIPTION_LIMIT = 4_096;

/**
 * 上限を超える文字列を切り詰めます。埋め込みやフィールドの制限に
 * 引っかかってエラーになるのを防ぐためのものです。
 *
 * ```ts
 * truncate("とても長い説明文...", 10);          // "とても長い説明文…"
 * truncate("とても長い説明文...", 10, "...");   // 末尾を変える
 * ```
 *
 * 末尾の既定は `defaultTheme.text.ellipsis` です。**この関数は
 * クライアントを知らないので `utils({ theme })` は効きません** —
 * Bot 全体の設定を効かせたい場合は `this.services.ui.truncate()` を
 * 使ってください。
 */
export function truncate(text: string, max: number, suffix = defaultTheme.text.ellipsis): string {
	if (max <= 0) return "";
	if (text.length <= max) return text;
	if (max <= suffix.length) return suffix.slice(0, max);

	let end = max - suffix.length;
	// サロゲートペアの途中で切らない。
	const code = text.charCodeAt(end - 1);
	if (code >= 0xd800 && code <= 0xdbff) end -= 1;
	return text.slice(0, end) + suffix;
}

/**
 * 配列を一定の大きさに分割します。ページネーションの元データ作りに。
 *
 * ```ts
 * const pages = chunk(members, 10).map((page) => page.join("\n"));
 * ```
 */
export function chunk<T>(items: readonly T[], size: number): T[][] {
	if (!Number.isInteger(size) || size < 1) {
		throw new RangeError(`chunk の size は 1 以上の整数である必要があります: ${size}`);
	}
	const result: T[][] = [];
	for (let index = 0; index < items.length; index += size) {
		result.push(items.slice(index, index + size));
	}
	return result;
}

export interface SplitMessageOptions {
	/** 1つあたりの最大文字数。 @default 2000 */
	max?: number;
	/** 区切りとして優先する文字列。 @default "\n" */
	separator?: string;
}

/**
 * 長文を送信可能な長さへ分割します(discord.js v14 で `Util.splitMessage`
 * が無くなったため)。区切り文字の位置で切り、それでも収まらない塊だけ
 * 強制的に分割します。
 *
 * ```ts
 * for (const part of splitMessage(logText)) await channel.send(part);
 * ```
 */
export function splitMessage(text: string, options: SplitMessageOptions = {}): string[] {
	const max = options.max ?? MESSAGE_LIMIT;
	const separator = options.separator ?? "\n";
	if (max < 1) throw new RangeError(`splitMessage の max は 1 以上である必要があります: ${max}`);
	if (text.length <= max) return text.length > 0 ? [text] : [];

	const parts: string[] = [];
	let current = "";

	const flush = () => {
		if (current.length > 0) parts.push(current);
		current = "";
	};
	const pushWithinLimit = (piece: string) => {
		let start = 0;
		while (start < piece.length) {
			let end = Math.min(start + max, piece.length);
			// UTF-16 の上限位置がサロゲートペアの途中なら、その直前で切る。
			if (
				end < piece.length &&
				end > start &&
				piece.charCodeAt(end - 1) >= 0xd800 &&
				piece.charCodeAt(end - 1) <= 0xdbff &&
				piece.charCodeAt(end) >= 0xdc00 &&
				piece.charCodeAt(end) <= 0xdfff
			) {
				end -= 1;
			}
			// max=1 では1つの補助文字を分割せず収めることができない。
			// 文字を壊すよりも、当該チャンクだけ2 code unitにする方を優先する。
			if (end === start) end = Math.min(start + 2, piece.length);
			parts.push(piece.slice(start, end));
			start = end;
		}
	};

	// 空文字を separator にすると String#split は UTF-16 code unit ごとに
	// 分解するため、絵文字のサロゲートペアがこのループへ届く前に壊れる。
	// 区切りなしの指定として扱い、元の文字列を安全な境界で直接分割する。
	if (separator.length === 0) {
		pushWithinLimit(text);
		return parts;
	}

	for (const piece of text.split(separator)) {
		// 単体で上限を超える塊は、区切り文字を無視して切り分ける。
		if (piece.length > max) {
			flush();
			pushWithinLimit(piece);
			continue;
		}
		const candidate = current.length > 0 ? current + separator + piece : piece;
		if (candidate.length > max) {
			flush();
			current = piece;
		} else {
			current = candidate;
		}
	}
	flush();
	return parts;
}

export interface ProgressBarOptions {
	/** 全体の文字数。 @default `defaultTheme.progress.width`(20) */
	width?: number;
	/** 進捗部分の文字。 @default `defaultTheme.progress.filled`("█") */
	filled?: string;
	/** 未進捗部分の文字。 @default `defaultTheme.progress.empty`("░") */
	empty?: string;
}

/**
 * 進捗バーを作ります — 再生位置、投票、レベルなどの表示に。
 *
 * ```ts
 * progressBar(30, 100, { width: 10 });                    // "███░░░░░░░"
 * progressBar(30, 100, { filled: "▬", empty: "―" });      // 見た目を変える
 * ```
 *
 * 既定は `defaultTheme.progress` です。**この関数はクライアントを知らないので
 * `utils({ theme })` は効きません** — Bot 全体の設定を効かせたい場合は
 * `this.services.ui.progressBar()` を使ってください。
 */
export function progressBar(value: number, total: number, options: ProgressBarOptions = {}): string {
	const width = Math.max(1, Math.floor(options.width ?? defaultTheme.progress.width));
	const filled = options.filled ?? defaultTheme.progress.filled;
	const empty = options.empty ?? defaultTheme.progress.empty;

	const ratio = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0;
	const done = Math.round(ratio * width);
	return filled.repeat(done) + empty.repeat(width - done);
}
