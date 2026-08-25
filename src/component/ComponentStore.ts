import { join } from "node:path";
import { Collection } from "discord.js";
import type { Logger } from "pino";
import { ComponentLoadError } from "../errors.js";
import { FrameworkEvents } from "../events.js";
import { collectModuleFiles } from "../discovery.js";
import type { Container } from "../container.js";
import { initializeComponent, type Component, type ComponentOptions } from "./Component.js";
import {
	getComponentOptions,
	getOwnComponentOptions,
	type AbstractComponentClass,
	type ComponentClass,
} from "./metadata.js";

export interface ComponentStoreOptions<T extends Component> {
	/**
	 * ストア名。ファイル自動探索の対象ディレクトリ名でもあります
	 * (`<baseDirectory>/<name>`)。慣例として複数形にします(例: `"commands"`)。
	 */
	name: string;
	/** この種別のコンポーネントが継承すべき基底クラス。 */
	base: AbstractComponentClass<T>;
	/**
	 * クラス名から取り除く接尾辞。既定はストア名の単数形
	 * (`"commands"` → `Command`)。**ディレクトリ名とクラス名の語が
	 * 揃わないときだけ** 指定します(例: `ai/` に置く `AiTool` は
	 * `{ name: "ai", suffix: "Tool" }`)。
	 */
	suffix?: string;
}

/**
 * 1種別のロード済みコンポーネントを保持し、そのロード方法を知るストア。
 *
 * ストアは拡張の単位です: プラグインは `ComponentStore` をサブクラス化して
 * {@link StoreRegistry} に登録し、{@link ComponentStore.bind} /
 * {@link ComponentStore.unbind} をオーバーライドすることで、新しい
 * コンポーネント種別を丸ごと追加できます。
 *
 * ストアは discord.js の `Collection` を継承しているため、その検索・走査
 * ユーティリティがそのまま使えます(`store.get(name)`、`store.filter`、
 * `store.map`、...)。
 */
export class ComponentStore<T extends Component> extends Collection<string, T> {
	/** ストア名(= 自動探索ディレクトリ名)。 */
	public readonly name: string;

	/** この種別のコンポーネントが継承する基底クラス。 */
	public readonly base: AbstractComponentClass<T>;

	/** クラス名から取り除く接尾辞({@link ComponentStoreOptions.suffix})。 */
	public readonly suffix: string;

	/** コンテナ。レジストリへの登録時に割り当てられます。 */
	declare public readonly container: Container;

	/** このストア用の子ロガー。登録時に割り当てられます。 */
	declare public readonly logger: Logger;

	readonly #pending: ComponentClass<T>[] = [];
	#loadedAll = false;

	public constructor(options: ComponentStoreOptions<T>) {
		super();
		this.name = options.name;
		this.base = options.base;
		this.suffix = options.suffix ?? singularize(options.name);
	}

	/**
	 * コンポーネントクラスを明示登録します(ファイル自動探索の代替)。
	 * {@link ComponentStore.loadAll} 前ならキューに積まれ、後なら即座に
	 * ロードされます(fire-and-forget — インスタンスを待つ場合は
	 * {@link ComponentStore.load} を使ってください)。
	 */
	public register(...classes: ComponentClass<T>[]): this {
		if (this.#loadedAll) {
			for (const cls of classes) {
				void this.load(cls).catch((error) =>
					this.logger.error({ err: error }, "明示登録コンポーネントのロードに失敗しました"),
				);
			}
		} else {
			this.#pending.push(...classes);
		}
		return this;
	}

	/**
	 * この種別のすべてのコンポーネントをロードします: 先に明示登録分、
	 * 次に `<baseDirectory>/<name>` のファイル自動探索(baseDirectory 設定時)。
	 * クライアント起動時にレジストリから呼ばれます。
	 */
	public async loadAll(baseDirectory: string | null): Promise<void> {
		// コンポーネントの onLoad() が同じストアへ register() することがある
		// (その時点では #loadedAll がまだ false なのでキューに積まれる)。
		// 1回の splice だと、その分が誰にも読まれず黙って消えるため、
		// キューが空になるまで排出する。
		await this.#drainPending();

		if (baseDirectory !== null) {
			await this.#loadDirectory(join(baseDirectory, this.name));
			// 自動探索されたコンポーネントの onLoad() が積んだ分も拾う。
			await this.#drainPending();
		}
		this.#loadedAll = true;
	}

	async #drainPending(): Promise<void> {
		while (this.#pending.length > 0) {
			for (const cls of this.#pending.splice(0)) await this.load(cls);
		}
	}

	/**
	 * 単一のコンポーネントクラスを構築・初期化・追加します。
	 * 同じクラスの二重ロードは既存インスタンスを返すだけで無害です。
	 * **別の** クラスが既存の名前に解決された場合は
	 * {@link ComponentLoadError} を投げます。
	 */
	public async load(cls: ComponentClass<T>, location: string | null = null): Promise<T> {
		const options = getComponentOptions(cls) as ComponentOptions;
		const ownName = getOwnComponentOptions(cls)?.name;
		const name = typeof ownName === "string" ? ownName : this.deriveName(cls.name);

		const existing = this.get(name);
		if (existing) {
			if (existing.constructor === cls) return existing;
			throw new ComponentLoadError(
				`${this.name} コンポーネント名 "${name}" が重複しています(${cls.name} と ${existing.constructor.name})`,
				{ path: location },
			);
		}

		let instance: T;
		try {
			instance = new cls();
		} catch (error) {
			throw new ComponentLoadError(
				`${this.name} コンポーネント "${name}" の構築に失敗しました。コンストラクタは引数なしで、初期化は onLoad() で行ってください。`,
				{ cause: error, path: location },
			);
		}

		initializeComponent(instance, { name, container: this.container, store: this, location });

		try {
			this.applyOptions(instance, options);
		} catch (error) {
			if (error instanceof ComponentLoadError) throw error;
			throw new ComponentLoadError(
				`${this.name} コンポーネント "${name}" のオプションが不正です`,
				{ cause: error, path: location },
			);
		}

		try {
			await instance.onLoad?.();
		} catch (error) {
			throw new ComponentLoadError(
				`${this.name} コンポーネント "${name}" の onLoad() に失敗しました`,
				{ cause: error, path: location },
			);
		}
		this.set(name, instance);
		try {
			this.bind(instance);
		} catch (error) {
			this.delete(name);
			const rollbackErrors: unknown[] = [];
			try {
				this.unbind(instance);
			} catch (rollbackError) {
				rollbackErrors.push(rollbackError);
			}
			try {
				await instance.onUnload?.();
			} catch (rollbackError) {
				rollbackErrors.push(rollbackError);
			}
			if (rollbackErrors.length > 0) {
				throw new ComponentLoadError(
					`${this.name} コンポーネント "${name}" の bind() 失敗後のロールバックにも失敗しました`,
					{
						cause: new AggregateError([error, ...rollbackErrors]),
						path: location,
					},
				);
			}
			throw error;
		}

		this.logger.debug({ component: name, location }, "コンポーネントをロードしました");
		this.container.client.emit(FrameworkEvents.ComponentLoaded, instance);
		return instance;
	}

	/** コンポーネントを取り除きます({@link ComponentStore.unbind} と `onUnload` を実行)。 */
	public async unload(resolvable: string | T): Promise<T> {
		const component = typeof resolvable === "string" ? this.get(resolvable) : resolvable;
		if (!component || this.get(component.name) !== component) {
			const name = typeof resolvable === "string" ? resolvable : resolvable.name;
			throw new ComponentLoadError(
				`未知の ${this.name} コンポーネント "${name}" はアンロードできません`,
			);
		}
		this.delete(component.name);
		this.unbind(component);
		await component.onUnload?.();
		this.logger.debug({ component: component.name }, "コンポーネントをアンロードしました");
		this.container.client.emit(FrameworkEvents.ComponentUnloaded, component);
		return component;
	}

	/** このストアのすべてのコンポーネントをアンロードします(クライアント終了時に使用)。 */
	public async unloadAll(): Promise<void> {
		for (const component of [...this.values()]) {
			await this.unload(component);
		}
	}

	/**
	 * クラス名からコンポーネント名を導出します: 種別サフィックス
	 * ({@link ComponentStore.suffix})を取り除き、ケバブケース化します
	 * (`UserInfoCommand` → `user-info`)。
	 * カスタム種別で慣例を変えたい場合はオーバーライドしてください。
	 */
	protected deriveName(className: string): string {
		return kebabCase(stripSuffix(className, this.suffix));
	}

	/**
	 * 解決済みメタデータをインスタンスへ適用します — 種別固有フィールドの
	 * 割り当てと必須項目の検証はここで行います。ロード時に弾く場合は
	 * ({@link ComponentLoadError} を推奨)例外を投げてください。
	 */
	protected applyOptions(component: T, options: ComponentOptions): void {
		void component;
		void options;
	}

	/**
	 * ロード済みコンポーネントをランタイムへ配線します(例: リスナーの
	 * イベント購読)。`onLoad` の後、ストアに追加された状態で呼ばれます。
	 */
	protected bind(component: T): void {
		void component;
	}

	/** {@link ComponentStore.bind} の逆操作。アンロード時に呼ばれます。 */
	protected unbind(component: T): void {
		void component;
	}

	async #loadDirectory(directory: string): Promise<void> {
		const paths = await collectModuleFiles(directory);

		for (const path of paths) {
			let module: Record<string, unknown>;
			try {
				module = (await import(path)) as Record<string, unknown>;
			} catch (error) {
				throw new ComponentLoadError(`${path} のインポートに失敗しました`, {
					cause: error,
					path,
				});
			}

			for (const exported of new Set(Object.values(module))) {
				if (this.#isComponentClass(exported)) {
					await this.load(exported, path);
				}
			}
		}
	}

	#isComponentClass(value: unknown): value is ComponentClass<T> {
		return (
			typeof value === "function" &&
			value !== this.base &&
			value.prototype instanceof this.base
		);
	}
}

/** ストア名を単数形にします("commands" → "command")。 */
function singularize(storeName: string): string {
	return storeName.endsWith("s") ? storeName.slice(0, -1) : storeName;
}

function stripSuffix(className: string, suffix: string): string {
	// 末尾一致(大文字小文字無視)で取り除く。丸ごと消える場合は残す。
	if (suffix.length === 0) return className;
	if (className.toLowerCase().endsWith(suffix.toLowerCase()) && className.length > suffix.length) {
		return className.slice(0, -suffix.length);
	}
	return className;
}

function kebabCase(value: string): string {
	return value
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
		.toLowerCase();
}
