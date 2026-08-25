import { ComponentStore } from "../component/ComponentStore.js";
import { Service, type Services } from "./Service.js";

/**
 * {@link Service} コンポーネントのストア。`services/` を走査します。
 *
 * サービスストアは最初にロードされるため、他のコンポーネントの `onLoad`
 * からもサービスを利用できます。ロード済みサービスは
 * `container.services` / `this.services` に名前で収束します。
 */
export class ServiceStore extends ComponentStore<Service> {
	readonly #registry: Record<string, Service> = {};

	public constructor() {
		super({ name: "services", base: Service });
	}

	/**
	 * `this.services.<名前>` としてアクセスされる名前付きレジストリ。
	 * 実体はロード時に埋まる動的なマップで、型は利用者の {@link Services}
	 * 宣言マージが保証します。
	 */
	public get registry(): Services {
		return this.#registry as unknown as Services;
	}

	/**
	 * サービス名は lowerCamelCase で導出します
	 * (`GuildSettingsService` → `guildSettings`)。
	 * オブジェクトのプロパティとして自然に参照できる形にするためです。
	 */
	protected override deriveName(className: string): string {
		const suffix = "Service";
		const base =
			className.endsWith(suffix) && className.length > suffix.length
				? className.slice(0, -suffix.length)
				: className;
		return base.charAt(0).toLowerCase() + base.slice(1);
	}

	protected override bind(service: Service): void {
		this.#registry[service.name] = service;
	}

	protected override unbind(service: Service): void {
		delete this.#registry[service.name];
	}
}
