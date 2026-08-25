import { Component, type ComponentOptions } from "../component/Component.js";
import { defineOptions } from "../component/metadata.js";

/**
 * サービス名からインスタンスへの型マップ。`this.services.<名前>` の型は
 * このインターフェースで決まります。サービスを定義したら、同じファイルで
 * 宣言マージしてください:
 *
 * ```ts
 * export class ConfigService extends Service { ... }
 *
 * declare module "@cc-discord-framework/core" {
 *   interface Services {
 *     config: ConfigService;
 *   }
 * }
 * ```
 */
export interface Services {}

export interface ServiceOptions extends ComponentOptions {}

/**
 * アプリケーション横断のロジック・状態を担うコンポーネント(データベース、
 * 設定、外部API クライアントなど)。
 *
 * `services/` ディレクトリに置くだけで自動ロードされ、あらゆるコンポーネント
 * から **import なしで** `this.services.<名前>` として参照できます。
 * 名前はクラス名から導出されます(`ConfigService` → `config`、
 * `GuildSettingsService` → `guildSettings`)。
 *
 * ```ts
 * @Service.define()
 * export class ConfigService extends Service {
 *   readonly ownerIds = (Bun.env.OWNER_IDS ?? "").split(",");
 * }
 *
 * // 別のコンポーネントから — import 不要:
 * this.services.config.ownerIds;
 * ```
 *
 * 初期化・後始末はライフサイクルで行います: 接続を開くのは `onLoad`、
 * 閉じるのは `onUnload`(`client.destroy()` で呼ばれます)。
 */
export abstract class Service extends Component {
	/** サービスのメタデータを宣言します。省略可能です。 */
	public static define(options: ServiceOptions = {}) {
		return defineOptions<Service>(options);
	}
}
