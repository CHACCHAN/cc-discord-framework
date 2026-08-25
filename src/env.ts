/**
 * 環境変数の読み出し。
 *
 * `.env` の値は「書いてあるが空」「カンマ区切り」「真偽値のつもりの文字列」
 * ばかりで、素の `Bun.env` を各所で読むと同じ整形コードが散らばります。
 * {@link createEnv} は、その定番の読み方を型のついた形でまとめたものです。
 *
 * ```ts
 * // config/_env.ts — 環境変数を読むのはこの1ファイルだけ、という形を推奨
 * import { createEnv } from "@cc-discord-framework/core";
 *
 * const reader = createEnv();
 *
 * export const env = Object.freeze({
 *   ownerIds: reader.list("OWNER_IDS"),
 *   aiModel: reader.text("AI_MODEL"),
 *   aiTools: reader.flag("AI_TOOLS", true),
 *   token: reader.required("SOME_API_KEY"),
 *   warnings: reader.warnings,
 * });
 * ```
 *
 * # 解釈できない値は「警告」になります
 *
 * `flag()` や `number()` が解釈できない値を見たとき、例外は投げません —
 * 既定値のまま {@link EnvReader.warnings} に積みます。環境変数の書き間違いは
 * 任意機能の設定であることが多く、それで Bot 全体を落としたくないためです。
 * 起動時に `warnings` をログへ流すかどうかは呼び出し側が決めてください。
 * 無いと動かない値には {@link EnvReader.required} を使います(こちらは
 * 投げます)。
 *
 * # 状態はインスタンスに閉じています
 *
 * 警告は {@link createEnv} が返すインスタンスに溜まります。モジュール
 * レベルの共有状態は持たないので、テストでは `createEnv({ ... })` に
 * 偽の環境を渡すだけで済みます。
 */
import { ConfigLoadError } from "./errors.js";

/** {@link createEnv} のオプション。語彙も区切りもここで差し替えられます。 */
export interface EnvOptions {
	/**
	 * {@link EnvReader.flag} が「有効」と解釈する語(小文字で比較)。
	 * @default ["on", "true", "1", "yes"]
	 */
	trueWords?: readonly string[];
	/**
	 * {@link EnvReader.flag} が「無効」と解釈する語(小文字で比較)。
	 * @default ["off", "false", "0", "no"]
	 */
	falseWords?: readonly string[];
	/**
	 * {@link EnvReader.list} の区切り文字。
	 * @default ","
	 */
	listSeparator?: string;
}

/** 環境変数の読み手。{@link createEnv} が作ります。 */
export interface EnvReader {
	/**
	 * 単一の文字列。未設定と空文字はどちらも `null` に寄せます —
	 * `.env` では「書いてあるが空」がふつうに起きるので、区別しても
	 * 意味がないためです。前後の空白は落とします。
	 */
	text(name: string): string | null;

	/**
	 * 必須の文字列。未設定・空なら {@link ConfigLoadError} を投げます。
	 * 無いと機能ごと動かない値(トークンなど)にだけ使ってください。
	 */
	required(name: string): string;

	/**
	 * 区切り文字(既定はカンマ)で分けた一覧。前後の空白と空要素は
	 * 落とします。未設定なら空配列です。
	 */
	list(name: string): readonly string[];

	/**
	 * 真偽値。未設定・空なら `fallback` を返します。解釈できない値は
	 * `fallback` のまま {@link EnvReader.warnings} に積みます — 綴りを
	 * 間違えたときに、黙って既定と逆の意味になるのを避けるためです。
	 */
	flag(name: string, fallback: boolean): boolean;

	/**
	 * 数値。未設定・空なら `fallback` を返します。数値として解釈できない
	 * 値は `fallback` のまま {@link EnvReader.warnings} に積みます。
	 */
	number(name: string, fallback: number): number;

	/**
	 * ここまでの読み出しで見つかった問題。起動時にまとめてログへ
	 * 流すことを想定しています(ライブビューです — 以後の読み出しで
	 * 増えます)。
	 */
	readonly warnings: readonly string[];
}

/**
 * 環境変数の読み手を作ります。
 *
 * @param source 読む対象。既定は `Bun.env`。テストでは
 *   `createEnv({ OWNER_IDS: "1,2" })` のように偽の環境を渡せます。
 * @param options 解釈の語彙や区切り文字({@link EnvOptions})。
 */
export function createEnv(
	source: Readonly<Record<string, string | undefined>> = Bun.env,
	options: EnvOptions = {},
): EnvReader {
	const trueWords = options.trueWords ?? ["on", "true", "1", "yes"];
	const falseWords = options.falseWords ?? ["off", "false", "0", "no"];
	const listSeparator = options.listSeparator ?? ",";
	const warnings: string[] = [];

	const text = (name: string): string | null => {
		const trimmed = (source[name] ?? "").trim();
		return trimmed === "" ? null : trimmed;
	};

	return {
		text,

		required(name) {
			const value = text(name);
			if (value === null) {
				throw new ConfigLoadError(
					`環境変数 ${name} が設定されていません。.env などで設定してください。`,
				);
			}
			return value;
		},

		list(name) {
			return (source[name] ?? "")
				.split(listSeparator)
				.map((entry) => entry.trim())
				.filter(Boolean);
		},

		flag(name, fallback) {
			const value = text(name);
			if (value === null) return fallback;
			const normalized = value.toLowerCase();
			if (trueWords.includes(normalized)) return true;
			if (falseWords.includes(normalized)) return false;
			warnings.push(
				`${name} の値 "${value}" は真偽値として解釈できません。既定(${fallback})のままにします。`,
			);
			return fallback;
		},

		number(name, fallback) {
			const value = text(name);
			if (value === null) return fallback;
			const parsed = Number(value);
			if (Number.isFinite(parsed)) return parsed;
			warnings.push(
				`${name} の値 "${value}" は数値として解釈できません。既定(${fallback})のままにします。`,
			);
			return fallback;
		},

		warnings,
	};
}
