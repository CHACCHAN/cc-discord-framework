import type { Awaitable, ClientEvents } from "discord.js";
import { Component, type ComponentOptions } from "../component/Component.js";
import { defineOptions } from "../component/metadata.js";

/**
 * リスナーが観測できるイベント: すべての discord.js クライアントイベントに
 * 加えて、フレームワーク自身のイベント(同じエミッターを共有します)。
 */
export type ListenerEvent = keyof ClientEvents;

/** `@Listener.define({...})` で宣言するリスナーメタデータ。 */
export interface ListenerOptions<E extends ListenerEvent = ListenerEvent>
	extends ComponentOptions {
	/** 購読するクライアントイベント。 */
	event: E;
	/** 最初の1回だけ処理して購読を解除する。 */
	once?: boolean;
}

/**
 * 1つのクライアントイベントを購読するリスナー。イベントはデコレータで
 * 宣言し、ジェネリクスにも同じものを指定します — ジェネリクスが `run` の
 * 引数を型付けし、両者の不一致はコンパイルエラーになります。
 *
 * ```ts
 * @Listener.define({ event: Events.MessageCreate })
 * export class MessageLogListener extends Listener<Events.MessageCreate> {
 *   override run(message: Message) {
 *     this.logger.info({ author: message.author.tag }, "メッセージを受信しました");
 *   }
 * }
 * ```
 */
export abstract class Listener<E extends ListenerEvent = ListenerEvent> extends Component {
	/** このリスナーが購読するイベント。 */
	declare public readonly event: E;

	/** 最初の1回で購読解除するかどうか。 */
	declare public readonly once: boolean;

	/** リスナーのメタデータを宣言します。必須です — リスナーにはイベントが必要です。 */
	public static define<const E extends ListenerEvent>(options: ListenerOptions<E>) {
		return defineOptions<Listener<E>>(options);
	}

	/** イベント1回分の処理。 */
	public abstract run(...args: ClientEvents[E]): Awaitable<unknown>;
}
