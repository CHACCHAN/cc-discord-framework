import type { Logger } from "pino";
import type { Client } from "./client.js";
import type { StoreRegistry } from "./component/StoreRegistry.js";
import type { Services } from "./service/Service.js";
import type { ServiceStore } from "./service/ServiceStore.js";
import type { ClientTexts } from "./texts.js";

/**
 * フレームワーク全体で共有されるサービス群。すべてのコンポーネントから
 * `this.container`、クライアントからは `client.container` で参照できます。
 *
 * コンテナは **クライアント毎** のインスタンスです(グローバルシングルトン
 * ではありません)。テストや複数クライアント構成でも状態が混ざりません。
 *
 * アプリケーション固有の共有ロジックは、原則として
 * {@link Services サービスコンポーネント}(`services/` ディレクトリ)で
 * 定義してください。コンテナへ直接プロパティを生やしたい場合は、
 * 宣言マージ + 代入だけで追加できます:
 *
 * ```ts
 * declare module "cc-discord-framework" {
 *   interface Container {
 *     redis: RedisClient;
 *   }
 * }
 *
 * // プラグインの install() 内、または login() 前に:
 * client.container.redis = createRedis();
 * ```
 */
export class Container {
	/** フレームワーククライアント。 */
	declare public readonly client: Client;

	/** ルートの pino ロガー。 */
	declare public readonly logger: Logger;

	/**
	 * フレームワークがユーザーへ返す文言(解決済み)。
	 * `new Client({ texts: { ... } })` で項目ごとに差し替えられます。
	 */
	declare public readonly texts: ClientTexts;

	/** すべてのコンポーネントストア。 */
	declare public readonly stores: StoreRegistry;

	/** ロード済みサービスの名前付きレジストリ(`services/` から自動収束)。 */
	public get services(): Services {
		return (this.stores.get("services") as ServiceStore).registry;
	}
}

/** @internal クライアント構築時に割り当てられます。 */
export function initializeContainer(
	container: Container,
	init: { client: Client; logger: Logger; stores: StoreRegistry; texts: ClientTexts },
): void {
	Object.assign(container, init);
}
