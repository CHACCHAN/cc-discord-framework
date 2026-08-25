/**
 * 意味づけされた色の埋め込み。
 *
 * 返るのは discord.js の `EmbedBuilder` そのものなので、以降は
 * いつもどおりチェーンできます — 独自クラスに閉じ込めません。
 * 色は[テーマ](./theme.ts)から取るので、Bot 全体で一度に変えられます。
 */
import { EmbedBuilder } from "@cc-discord-framework/core";
import { resolveTheme, type ColorTheme, type Theme, type ThemeOptions } from "./theme.js";

/** {@link createEmbeds} が返す埋め込みファクトリ。 */
export interface Embeds {
	/** 成功。 */
	success(description?: string): EmbedBuilder;
	/** 失敗。`Error` を渡すと `message` が説明文になります。 */
	error(description?: string | Error): EmbedBuilder;
	/** 警告。 */
	warning(description?: string): EmbedBuilder;
	/** 情報。 */
	info(description?: string): EmbedBuilder;
	/** 任意の色。テーマの色名(`"success"` など)か色コードを渡します。 */
	of(color: keyof ColorTheme | number, description?: string | Error): EmbedBuilder;
	/** この埋め込みが使っている色。 */
	readonly colors: ColorTheme;
}

/**
 * テーマの色を使う埋め込みファクトリを作ります。
 *
 * コンポーネントの中では `this.services.ui` が同じものを提供するので、
 * 通常こちらを直接呼ぶ必要はありません。クライアントの外(ユーティリティ
 * 関数やスクリプト)で使いたいときの入口です。
 *
 * ```ts
 * const embeds = createEmbeds({ colors: { success: 0x00ffaa } });
 * embeds.success("保存しました").setTitle("設定");
 * ```
 */
export function createEmbeds(theme: Theme | ThemeOptions = {}): Embeds {
	const colors = resolveTheme(theme).colors;

	const build = (color: number, description?: string | Error): EmbedBuilder => {
		const embed = new EmbedBuilder().setColor(color);
		if (description !== undefined) {
			embed.setDescription(description instanceof Error ? description.message : description);
		}
		return embed;
	};

	return {
		colors,
		success: (description) => build(colors.success, description),
		error: (description) => build(colors.error, description),
		warning: (description) => build(colors.warning, description),
		info: (description) => build(colors.info, description),
		of: (color, description) =>
			build(typeof color === "number" ? color : colors[color], description),
	};
}
