import { ComponentLoadError } from "../errors.js";
import { FrameworkEvents } from "../events.js";
import { ComponentStore } from "../component/ComponentStore.js";
import { Listener, type ListenerOptions } from "./Listener.js";

/**
 * {@link Listener} コンポーネントのストア。`listeners/` を走査します。
 *
 * リスナーの追加はクライアントへの購読、アンロード(クライアント終了を
 * 含む)は購読解除に対応します。
 */
export class ListenerStore extends ComponentStore<Listener> {
	readonly #handlers = new WeakMap<Listener, (...args: unknown[]) => void>();

	public constructor() {
		super({ name: "listeners", base: Listener });
	}

	protected override applyOptions(listener: Listener, options: ListenerOptions): void {
		if (typeof options.event !== "string" || options.event.length === 0) {
			throw new ComponentLoadError(
				`リスナー "${listener.name}" にイベントが宣言されていません — @Listener.define({ event }) を追加してください`,
			);
		}
		Object.assign(listener, { event: options.event, once: options.once ?? false });
	}

	protected override bind(listener: Listener): void {
		const handler = (...args: unknown[]): void => {
			void this.#dispatch(listener, args);
		};
		this.#handlers.set(listener, handler);

		const client = this.container.client;
		if (listener.once) client.once(listener.event, handler);
		else client.on(listener.event, handler);
	}

	protected override unbind(listener: Listener): void {
		const handler = this.#handlers.get(listener);
		if (handler) {
			this.container.client.off(listener.event, handler);
			this.#handlers.delete(listener);
		}
	}

	async #dispatch(listener: Listener, args: unknown[]): Promise<void> {
		try {
			// エミッターからは unknown[] で届くが、リスナーのジェネリクスが
			// 宣言イベントに対する `run` の型付けを既に保証している。
			await (listener.run as (...eventArgs: unknown[]) => unknown)(...args);
		} catch (error) {
			// listenerError 自体のリスナーで失敗した場合は再発火しない(ループ防止)。
			const handled =
				listener.event !== FrameworkEvents.ListenerError &&
				this.container.client.emit(FrameworkEvents.ListenerError, error, listener);
			if (!handled) {
				listener.logger.error(
					{ err: error, event: listener.event },
					"リスナーの実行に失敗しました",
				);
			}
		}
	}
}
