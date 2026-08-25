import { Service } from "cc-discord-framework";
import { env } from "../config/_env.js";

/**
 * 環境変数の設定。どこからでも `this.services.config` で参照できます。
 *
 * 値を読んで検証するのは `src/config/_env.ts` です(このクライアントで
 * 環境変数を読むのはあの1ファイルだけ)。ここはそれを、import 無しで
 * 参照できる形に載せ替えているだけです。
 */
@Service.define()
export class ConfigService extends Service {
	readonly ownerIds = env.ownerIds;
}

declare module "cc-discord-framework" {
	interface Services {
		config: ConfigService;
	}
}
