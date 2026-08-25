/**
 * 応答の見せ方を1箇所に閉じたヘルパー。
 *
 * **埋め込みにするかどうかの分岐はここだけ**です。同梱コマンドも
 * {@link AiService.reply} もここを通るので、`display.embeds` /
 * `display.allowedMentions` / `display.decorate` / `display.payload` の
 * 効き方が揃います。
 *
 * 色は `@cc-discord-framework/utils` のテーマから取ります。`utils()` を
 * 入れていなくても既定のテーマで動くので、`this.services.ui` は使いません。
 */
import { createEmbeds, themeOf } from "@cc-discord-framework/utils";
import type { EmbedBuilder, MessageMentionOptions } from "cc-discord-framework";
import { aiConfigOf } from "./config.js";
import type { AiReplyKind } from "./texts.js";

/** 送信・編集にそのまま渡せるペイロード。 */
export type AiMessagePayload =
	| { content: string; embeds?: undefined; allowedMentions?: MessageMentionOptions }
	| { embeds: EmbedBuilder[]; allowedMentions?: MessageMentionOptions };

/**
 * `display.payload` フックへ渡る文脈。
 *
 * 分割された応答は2通目以降も同じフックを通るので、`index` / `total` で
 * 「何通目か」を見て出し分けられます。
 */
export interface AiPayloadContext {
	/** 応答の意味づけ(埋め込みの色に使われているもの)。 */
	readonly kind: AiReplyKind;
	/** 分割された何通目か(1始まり)。 */
	readonly index: number;
	/** 分割された総通数。 */
	readonly total: number;
	/** 途中経過か(あとで書き換わる送信なら `true`・最終の送信なら `false`)。 */
	readonly streaming: boolean;
}

/** {@link renderAiPayload} の上書き。 */
export interface RenderOptions {
	/** 埋め込みで返すか。省略すると `display.embeds`。 */
	embeds?: boolean;
	/** 分割された何通目か(1始まり)。`display.payload` へ渡ります。 @default 1 */
	index?: number;
	/** 分割された総通数。`display.payload` へ渡ります。 @default 1 */
	total?: number;
	/** 途中経過か。`display.payload` へ渡ります。 @default false */
	streaming?: boolean;
}

/**
 * 本文を送信ペイロードにします。
 *
 * `source` にはインタラクションかメッセージを渡してください — そこから
 * クライアントを辿って設定とテーマを解決するので、呼び出し側が設定を
 * 持ち回る必要がありません。
 *
 * メンションの解決範囲は `display.allowedMentions`(既定は
 * `{ parse: [] }` = どのメンションも解決しない)から入ります。
 * モデルの出力をそのまま `content` に流すため、**既定では `@everyone` を
 * 書かれても発火しません**。
 */
export function renderAiPayload(
	source: { client?: unknown } | null | undefined,
	body: string,
	kind: AiReplyKind = "info",
	options: RenderOptions = {},
): AiMessagePayload {
	const { display } = aiConfigOf(source);

	// `null` なら discord.js の既定に任せる(明示的に許可したい人向け)。
	const mentions: { allowedMentions?: MessageMentionOptions } =
		display.allowedMentions === null ? {} : { allowedMentions: display.allowedMentions };

	let payload: AiMessagePayload;
	if (options.embeds ?? display.embeds) {
		const embed = createEmbeds(themeOf(source))[kind](body);
		payload = { embeds: [display.decorate ? display.decorate(embed, kind) : embed], ...mentions };
	} else {
		payload = { content: body, ...mentions };
	}

	// `payload` フックは decorate のあと(= 送信直前)に必ず通す。
	if (display.payload === undefined) return payload;
	return display.payload(payload, {
		kind,
		index: options.index ?? 1,
		total: options.total ?? 1,
		streaming: options.streaming ?? false,
	});
}
