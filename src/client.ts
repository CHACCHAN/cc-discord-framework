import { dirname, resolve } from "node:path";
import {
	Client as DiscordClient,
	Events,
	type Awaitable,
	type ClientOptions as DiscordClientOptions,
	type Message,
} from "discord.js";
import type { Logger, LoggerOptions } from "pino";
import { Container, initializeContainer } from "./container.js";
import { StoreRegistry } from "./component/StoreRegistry.js";
import { ServiceStore } from "./service/ServiceStore.js";
import { CommandStore } from "./command/CommandStore.js";
import { ListenerStore } from "./listener/ListenerStore.js";
import { PreconditionStore } from "./precondition/PreconditionStore.js";
import { resolveLogger } from "./logger.js";
import { resolveClientTexts, type ClientTextsOptions } from "./texts.js";
import type { Component } from "./component/Component.js";
import type { ComponentClass } from "./component/metadata.js";
import type { Plugin } from "./plugin.js";

export interface ClientOptions extends DiscordClientOptions {
	/**
	 * コンポーネント自動探索のルートディレクトリ。各ストアが
	 * `<baseDirectory>/<ストア名>`(`services/`、`commands/`、`listeners/`、
	 * `preconditions/`、...)を走査します。
	 *
	 * 既定はプロセスのエントリポイント(`Bun.main`)のあるディレクトリです。
	 * `null` を渡すと自動探索を無効化し、明示登録のみになります。
	 */
	baseDirectory?: string | URL | null;

	/**
	 * フレームワークのロガー: 採用したい pino インスタンス、または pino に
	 * 渡すオプション。既定は `pino({ level: "info" })` です。
	 */
	logger?: Logger | LoggerOptions;

	/** プラグイン。{@link Client.load} の冒頭で配列順にインストールされます。 */
	plugins?: readonly Plugin[];

	/**
	 * フレームワークがユーザーへ返す文言。指定した項目だけが既定値
	 * ({@link defaultClientTexts})を上書きします。
	 */
	texts?: ClientTextsOptions;

	/**
	 * メッセージ(プレフィックス)コマンドを有効にするプレフィックス。
	 * 省略(または `null`)でスラッシュコマンド専用の Bot になります。
	 */
	defaultPrefix?: string | readonly string[] | null;

	/**
	 * メッセージ毎にプレフィックスを解決します(ギルド毎のプレフィックス等)。
	 * `defaultPrefix` より優先され、`null` を返すとそのメッセージでは
	 * メッセージコマンドが無効になります。コンテナが渡されるため、
	 * クライアント変数を参照せずにサービスへ到達できます。
	 */
	fetchPrefix?: (
		message: Message,
		container: Container,
	) => Awaitable<string | readonly string[] | null>;

	/**
	 * クライアントの ready 時にスラッシュコマンドを Discord へ一括登録する。
	 * @default true
	 */
	syncApplicationCommands?: boolean;

	/**
	 * スラッシュコマンドを登録する既定のギルド — 開発中に便利です
	 * (ギルドコマンドは即時反映)。コマンド側の `guildIds` が優先され、
	 * どちらもなければグローバル登録になります。
	 */
	applicationGuildIds?: readonly string[];
}

/**
 * フレームワーククライアント — コンテナ・コンポーネントストア・コマンド
 * ランタイムを備えた discord.js の `Client` です。
 *
 * 決められたディレクトリ(`services/` `commands/` `listeners/`
 * `preconditions/` ...)にクラスを置くだけで、フレームワークが自動で
 * インポートして制御します。エントリポイントは最小で済みます:
 *
 * ```ts
 * const client = new Client({
 *   intents: [GatewayIntentBits.Guilds],
 * });
 * await client.login(); // DISCORD_TOKEN 環境変数を自動使用
 * ```
 *
 * ライフサイクル: `login()` → プラグイン install → ストアのロード
 * (明示登録 + ファイル自動探索)→ ディスパッチャ接続 → ゲートウェイ接続
 * → ready 後にスラッシュコマンド同期。
 */
export class Client<Ready extends boolean = boolean> extends DiscordClient<Ready> {
	/** フレームワーク共有サービス。 */
	public readonly container: Container;

	/** ルートの pino ロガー。 */
	public readonly logger: Logger;

	/** すべてのコンポーネントストア。 */
	public readonly stores: StoreRegistry;

	/** 解決済みの自動探索ルート(`null` = 自動探索なし)。 */
	public readonly baseDirectory: string | null;

	readonly #plugins: readonly Plugin[];
	readonly #fetchPrefix: (
		message: Message,
		container: Container,
	) => Awaitable<string | readonly string[] | null>;
	readonly #messageCommandsEnabled: boolean;
	readonly #syncApplicationCommands: boolean;
	readonly #applicationGuildIds: readonly string[] | undefined;
	readonly #pendingComponents: ComponentClass<Component>[] = [];
	#loading: Promise<void> | null = null;
	/**
	 * ロードを開始したか。`#loading` とは別に持ちます — `#loading` への代入は
	 * `#doLoad()` が最初の `await` に達したあとなので、**最初のプラグインの
	 * install() だけが `#loading` を見られない**(結果、その register() だけが
	 * キューへ回って他より後にロードされる)というズレが起きます。
	 */
	#started = false;

	public constructor(options: ClientOptions) {
		super(options);

		this.logger = resolveLogger(options.logger);
		this.container = new Container();
		this.stores = new StoreRegistry(this.container);
		initializeContainer(this.container, {
			client: this as Client,
			logger: this.logger,
			stores: this.stores,
			texts: resolveClientTexts(options.texts),
		});

		// サービスは他コンポーネントの onLoad から使えるよう最初にロードする。
		this.stores.register(new ServiceStore());
		this.stores.register(new CommandStore());
		this.stores.register(new ListenerStore());
		this.stores.register(new PreconditionStore());

		this.baseDirectory = resolveBaseDirectory(options.baseDirectory);
		this.#plugins = options.plugins ?? [];

		const defaultPrefix = options.defaultPrefix ?? null;
		this.#fetchPrefix = options.fetchPrefix ?? (() => defaultPrefix);
		this.#messageCommandsEnabled = options.fetchPrefix !== undefined || defaultPrefix !== null;
		this.#syncApplicationCommands = options.syncApplicationCommands ?? true;
		this.#applicationGuildIds = options.applicationGuildIds;
	}

	/**
	 * コンポーネントクラスを明示登録します。担当ストアは各クラスの基底
	 * (Command / Listener / Precondition / Service / プラグイン追加種別)
	 * から自動で推論されます。
	 *
	 * `load()` 前の呼び出しはキューに積まれ、プラグインの install 後に
	 * 解決されるため、プラグイン種別のコンポーネントも呼び出し順を
	 * 気にせず登録できます。`load()` 開始後(= プラグインの install 中)の
	 * 呼び出しは、**何番目のプラグインからでも** 同じようにその場で
	 * ストアへ渡されます。
	 */
	public register(...classes: ComponentClass<Component>[]): this {
		if (this.#started) {
			for (const cls of classes) {
				this.stores.resolve(cls).register(cls);
			}
		} else {
			this.#pendingComponents.push(...classes);
		}
		return this;
	}

	/**
	 * Discord に接続せずにフレームワークを起動します: プラグインの
	 * インストール、全コンポーネントのロード、ディスパッチャの接続。
	 * 冪等で、`login()` から自動的に呼ばれます。テストや起動スモーク
	 * チェックに便利です。
	 */
	public async load(): Promise<void> {
		this.#loading ??= this.#doLoad();
		return this.#loading;
	}

	/** フレームワークをロードし、Discord ゲートウェイへ接続します。 */
	public override async login(token?: string): Promise<string> {
		await this.load();
		return super.login(token ?? Bun.env.DISCORD_TOKEN);
	}

	/** 全コンポーネントをアンロード(`onUnload` 実行)してから接続を破棄します。 */
	public override async destroy(): Promise<void> {
		// 起動途中での破棄は行わない: 進行中の load() を先に待つ
		// (load() 自体の失敗は load() の呼び出し元に伝わる)。
		if (this.#loading) await this.#loading.catch(() => {});
		await this.stores.unloadAll();
		return super.destroy();
	}

	async #doLoad(): Promise<void> {
		// 最初の install より前に立てる。どのプラグインの register() も
		// 同じ扱いになり、ロード順が install 順と一致する。
		this.#started = true;

		for (const plugin of this.#plugins) {
			this.logger.debug({ plugin: plugin.name }, "プラグインをインストールします");
			await plugin.install(this as Client);
		}

		for (const cls of this.#pendingComponents.splice(0)) {
			this.stores.resolve(cls).register(cls);
		}

		await this.stores.loadAll(this.baseDirectory);

		const commands = this.stores.get("commands");
		commands.validateReferences(this.stores.get("preconditions"));

		this.on(Events.InteractionCreate, (interaction) => {
			if (interaction.isChatInputCommand()) {
				void commands.dispatchChatInput(interaction);
			} else if (interaction.isAutocomplete()) {
				void commands.dispatchAutocomplete(interaction);
			}
		});

		if (this.#messageCommandsEnabled) {
			this.on(Events.MessageCreate, (message) => {
				void this.#dispatchMessage(commands, message);
			});
		}

		this.once(Events.ClientReady, () => {
			if (!this.#syncApplicationCommands) return;
			void commands
				.syncApplicationCommands(this.#applicationGuildIds)
				.catch((error) =>
					this.logger.error(
						{ err: error },
						"アプリケーションコマンドの同期に失敗しました",
					),
				);
		});

		this.logger.info(
			{
				components: Object.fromEntries(
					[...this.stores].map((store) => [store.name, store.size]),
				),
			},
			"フレームワークをロードしました",
		);
	}

	async #dispatchMessage(commands: CommandStore, message: Message): Promise<void> {
		try {
			const resolved = await this.#fetchPrefix(message, this.container);
			if (resolved === null) return;
			const prefixes = typeof resolved === "string" ? [resolved] : resolved;
			await commands.dispatchMessage(message, prefixes);
		} catch (error) {
			this.logger.error({ err: error }, "メッセージコマンドのディスパッチに失敗しました");
		}
	}
}

function resolveBaseDirectory(option: string | URL | null | undefined): string | null {
	if (option === null) return null;
	if (option === undefined) return Bun.main ? dirname(Bun.main) : null;
	return typeof option === "string" ? resolve(option) : Bun.fileURLToPath(option);
}
