/**
 * インタラクションとメッセージの差を吸収する送信口。
 *
 * スラッシュコマンドとメッセージコマンドで UI ヘルパーの書き分けが
 * 発生しないよう、「送る」と「あとで書き換える」の2つだけに畳んでいます。
 * ephemeral な返信は `Message#edit` では書き換えられないため、編集は
 * 必ず送信元の作法へ委譲します。
 */
import { Message, MessageFlags, type BaseMessageOptions, type RepliableInteraction } from "cc-discord-framework";

/** UI ヘルパーを呼べる相手 — 返信可能なインタラクション、またはメッセージ。 */
export type ReplyTarget = RepliableInteraction | Message;

/** 送信済みメッセージと、その正しい書き換え方の組。 */
export interface SentReply {
	/** 送信されたメッセージ(コレクターを張る対象)。 */
	readonly message: Message;
	/** 送信元に応じた方法で内容を差し替えます。 */
	edit(payload: BaseMessageOptions): Promise<Message>;
}

/** 呼び出したユーザーの ID。既定の操作許可者として使います。 */
export function invokerId(target: ReplyTarget): string {
	return target instanceof Message ? target.author.id : target.user.id;
}

/** 送信元の作法に合わせて送信し、書き換え口とともに返します。 */
export async function sendReply(
	target: ReplyTarget,
	payload: BaseMessageOptions,
	options: { ephemeral?: boolean } = {},
): Promise<SentReply> {
	if (target instanceof Message) {
		const message = await target.reply(payload);
		return { message, edit: (next) => message.edit(next) };
	}

	if (target.deferred || target.replied) {
		const message = await target.editReply(payload);
		return { message, edit: (next) => target.editReply(next) };
	}

	await target.reply({
		...payload,
		...(options.ephemeral ? { flags: MessageFlags.Ephemeral } : {}),
	});
	const message = await target.fetchReply();
	return { message, edit: (next) => target.editReply(next) };
}
