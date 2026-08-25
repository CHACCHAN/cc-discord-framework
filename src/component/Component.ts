import type { Logger } from "pino";
import type { Container } from "../container.js";
import type { Client } from "../client.js";
import type { Services } from "../service/Service.js";
import type { ComponentStore } from "./ComponentStore.js";

/** すべてのコンポーネント種別が共有するオプション。 */
export interface ComponentOptions {
	/**
	 * ストア内で一意なコンポーネント名。
	 * 省略時はクラス名から導出されます(例: `PingCommand` → `ping`)。
	 */
	name?: string;
}

/**
 * フレームワークにロードされるあらゆる単位の基底クラス。
 *
 * コンポーネントは **引数なし** で構築されます — コンストラクタ引数を
 * 宣言しないでください。構築直後にフレームワークが `name` / `container` /
 * `store` / `logger` / `location` を初期化し、その後 {@link Component.onLoad}
 * を呼びます。フレームワークのサービスが必要な初期化はコンストラクタでは
 * なく `onLoad` で行ってください。
 */
export abstract class Component {
	/** ストア内で一意なコンポーネント名。 */
	declare public readonly name: string;

	/** フレームワーク共有サービスを持つコンテナ。 */
	declare public readonly container: Container;

	/** このコンポーネントが属するストア。 */
	declare public readonly store: ComponentStore<Component>;

	/** このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。 */
	declare public readonly logger: Logger;

	/** 自動探索されたファイルの絶対パス。明示登録の場合は `null`。 */
	declare public readonly location: string | null;

	/** フレームワーククライアント。 */
	public get client(): Client {
		return this.container.client;
	}

	/**
	 * ロード済みサービスへのアクセス(`services/` から自動収束)。
	 * import せずに `this.services.<名前>` で参照できます。
	 */
	public get services(): Services {
		return this.container.services;
	}

	/** 初期化後・ストア追加前に呼ばれます。 */
	public onLoad?(): unknown | Promise<unknown>;

	/** ストアから取り除かれるときに呼ばれます(クライアント終了時を含む)。 */
	public onUnload?(): unknown | Promise<unknown>;
}

/** @internal 構築直後のコンポーネントへ割り当てる初期化データ。 */
export interface ComponentInit {
	name: string;
	container: Container;
	store: ComponentStore<Component>;
	location: string | null;
}

/**
 * @internal 構築直後のコンポーネントへフレームワーク管理フィールドを
 * 割り当てます。ストアだけが呼び出します。Public API ではありません。
 */
export function initializeComponent(component: Component, init: ComponentInit): void {
	Object.assign(component, {
		name: init.name,
		container: init.container,
		store: init.store,
		location: init.location,
		logger: init.container.logger.child({ store: init.store.name, component: init.name }),
	});
}
