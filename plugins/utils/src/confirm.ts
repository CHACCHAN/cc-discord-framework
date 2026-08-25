/**
 * 「本当に実行しますか?」の2択 UI。
 */
import {
	ActionRowBuilder,
	ButtonBuilder,
	ComponentType,
	type APIEmbed,
	type EmbedBuilder,
} from "cc-discord-framework";
import { parseDuration, type DurationInput } from "./duration.js";
import { invokerId, sendReply, type ReplyTarget } from "./reply.js";
import {
	applyButtonTheme,
	buttonTheme,
	resolveTheme,
	themeOf,
	type ButtonTheme,
	type ThemeOptions,
} from "./theme.js";

export interface ConfirmOptions {
	/** 本文。 */
	content?: string;
	/** 本文の代わり(または併用)に出す埋め込み。 */
	embeds?: readonly (EmbedBuilder | APIEmbed)[];
	/** 承認ボタン。文字列ならラベルだけの変更。 @default テーマの `confirm.yes` */
	yes?: string | Partial<ButtonTheme>;
	/** 拒否ボタン。文字列ならラベルだけの変更。 @default テーマの `confirm.no` */
	no?: string | Partial<ButtonTheme>;
	/** 応答を待つ時間。過ぎたら `false`。 @default テーマの `confirm.timeout`("1m") */
	timeout?: DurationInput;
	/** 押せるユーザー。 @default 呼び出したユーザー */
	userId?: string;
	/** 誰でも押せるようにする。 @default false */
	anyone?: boolean;
	/** 本人にだけ見える返信にする(インタラクションのみ)。 @default false */
	ephemeral?: boolean;
	/** この呼び出しだけテーマを上書きする。 */
	theme?: ThemeOptions;
}

/**
 * 確認ダイアログを出し、押されたボタンを待ちます。
 * タイムアウト・拒否のどちらも `false` になるので、`if` ひとつで書けます。
 *
 * ```ts
 * if (!(await confirm(interaction, { content: "全件削除します。よろしいですか?" }))) return;
 * await purge();
 * ```
 *
 * ラベル・色・待ち時間は Bot 全体のテーマ(`utils({ theme })`)から取り、
 * この関数の `options` でその場だけ上書きできます。
 */
export async function confirm(target: ReplyTarget, options: ConfirmOptions = {}): Promise<boolean> {
	// 呼び出しごとの上書きは、クライアントのテーマの「上へ」重ねる
	// (置き換えてしまうと Bot 全体の設定が消えてしまうため)。
	const theme = resolveTheme(options.theme, themeOf(target));
	const yes = buttonTheme(theme.confirm.yes, options.yes);
	const no = buttonTheme(theme.confirm.no, options.no);

	const id = crypto.randomUUID().slice(0, 8);
	const yesId = `${id}:yes`;
	const noId = `${id}:no`;

	const row = (disabled: boolean) =>
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			applyButtonTheme(new ButtonBuilder().setCustomId(yesId).setDisabled(disabled), yes),
			applyButtonTheme(new ButtonBuilder().setCustomId(noId).setDisabled(disabled), no),
		);

	const body = {
		content: options.content ?? "",
		embeds: [...(options.embeds ?? [])],
	};

	const reply = await sendReply(
		target,
		{ ...body, components: [row(false)] },
		{ ephemeral: options.ephemeral },
	);

	const allowed = options.anyone ? null : (options.userId ?? invokerId(target));

	let button;
	try {
		button = await reply.message.awaitMessageComponent({
			componentType: ComponentType.Button,
			time: parseDuration(options.timeout ?? theme.confirm.timeout),
			filter: (interaction) =>
				(interaction.customId === yesId || interaction.customId === noId) &&
				(allowed === null || interaction.user.id === allowed),
		});
	} catch {
		// 時間切れ。ボタンを無効化して閉じる(消えている場合もあるので握りつぶす)。
		await reply.edit({ ...body, components: [row(true)] }).catch(() => undefined);
		return false;
	}

	// 答えはボタンが押れた時点で確定している。そのあとの表示の後始末
	// (ボタンの無効化)が失敗しても — メッセージが消えた等 — 答えは
	// 変えない。ここで false に落とすと「はい」が黙って「いいえ」に化ける。
	await button.update({ ...body, components: [row(true)] }).catch(() => undefined);
	return button.customId === yesId;
}
