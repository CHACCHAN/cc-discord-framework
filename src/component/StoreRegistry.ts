import { Collection } from "discord.js";
import { FrameworkError } from "../errors.js";
import type { Container } from "../container.js";
import type { Component } from "./Component.js";
import type { ComponentClass } from "./metadata.js";
import type { ComponentStore } from "./ComponentStore.js";
import type { CommandStore } from "../command/CommandStore.js";
import type { ListenerStore } from "../listener/ListenerStore.js";
import type { PreconditionStore } from "../precondition/PreconditionStore.js";
import type { ServiceStore } from "../service/ServiceStore.js";

/**
 * ストア名から具象ストア型へのマップ。`stores.get("commands")` の型付けを
 * 担います。コンポーネント種別を追加するプラグインはこのインターフェースを
 * 宣言マージしてください:
 *
 * ```ts
 * declare module "@cc-discord-framework/core" {
 *   interface Stores {
 *     tasks: TaskStore;
 *   }
 * }
 * ```
 */
export interface Stores {
	services: ServiceStore;
	commands: CommandStore;
	listeners: ListenerStore;
	preconditions: PreconditionStore;
}

/**
 * クライアントが持つ全コンポーネントストアの集合。
 *
 * コア種別(`services` / `commands` / `listeners` / `preconditions`)は
 * クライアント自身が登録し、追加のストアはプラグインが install 時に
 * 登録します。
 */
export class StoreRegistry implements Iterable<ComponentStore<Component>> {
	readonly #stores = new Collection<string, ComponentStore<Component>>();
	readonly #container: Container;

	/** @internal クライアントが構築します。 */
	public constructor(container: Container) {
		this.#container = container;
	}

	/** ストアを登録します。クライアントのロード前に行ってください(プラグインの install で間に合います)。 */
	public register(store: ComponentStore<Component>): this {
		if (this.#stores.has(store.name)) {
			throw new FrameworkError(`ストア "${store.name}" はすでに登録されています`);
		}
		Object.assign(store, {
			container: this.#container,
			logger: this.#container.logger.child({ store: store.name }),
		});
		this.#stores.set(store.name, store);
		return this;
	}

	/** ストアを名前で取得します。{@link Stores} インターフェースにより型付けされます。 */
	public get<K extends keyof Stores>(name: K): Stores[K];
	public get(name: string): ComponentStore<Component> | undefined;
	public get(name: string): ComponentStore<Component> | undefined {
		return this.#stores.get(name);
	}

	/**
	 * コンポーネントクラスの担当ストアをプロトタイプチェーンから解決します。
	 * 基底クラスが入れ子の場合は、より具体的なストアが優先されます。
	 */
	public resolve(cls: ComponentClass<Component>): ComponentStore<Component> {
		let best: ComponentStore<Component> | undefined;
		for (const store of this.#stores.values()) {
			if (!(cls.prototype instanceof store.base)) continue;
			if (!best || store.base.prototype instanceof best.base) best = store;
		}
		if (!best) {
			throw new FrameworkError(
				`${cls.name} を受け入れるストアがありません。コンポーネントは登録済み種別の基底クラス(Command / Listener / Precondition / Service / ...)を継承してください。`,
			);
		}
		return best;
	}

	/**
	 * すべてのストアを登録順に順次ロードします。ロード時のイベントと失敗を
	 * 決定的にするためです。
	 */
	public async loadAll(baseDirectory: string | null): Promise<void> {
		for (const store of this.#stores.values()) {
			await store.loadAll(baseDirectory);
		}
	}

	/** すべてのストアのコンポーネントを登録の逆順にアンロードします。 */
	public async unloadAll(): Promise<void> {
		for (const store of [...this.#stores.values()].reverse()) {
			await store.unloadAll();
		}
	}

	public [Symbol.iterator](): Iterator<ComponentStore<Component>> {
		return this.#stores.values();
	}
}
