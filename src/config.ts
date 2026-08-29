import { dirname, resolve } from "node:path";
import { IntentsBitField, type Partials } from "discord.js";
import { Client, type ClientOptions } from "./client.js";
import { collectModuleFiles } from "./discovery.js";
import { ConfigLoadError } from "./errors.js";
import type { Plugin } from "./plugin.js";

/**
 * 設定ファイル1枚が返すもの。{@link ClientOptions} の部分指定に、
 * ローダーだけが読む `priority` を足したものです。
 *
 * 1枚に全部書く必要はありません。関心ごとにファイルを分け
 * (`config/intents.ts`、`config/music.ts`、`config/ai.ts` ...)、
 * ローダーが1つの {@link ClientOptions} にまとめます。
 */
export interface ClientConfig extends Partial<ClientOptions> {
	/**
	 * 読み込み順。大きいほど先(= プラグインが先にインストールされる)。
	 * 同じ値ならファイル名順。
	 * @default 0
	 */
	priority?: number;
}

/**
 * 設定ファイルの中身に型を付けるだけの関数({@link definePlugin} と同じ
 * 役割)。設定ファイルは必ずこれを default export します:
 *
 * ```ts
 * // config/music.ts
 * export default defineConfig({
 *   priority: 10,
 *   plugins: [music({ maxVolume: 200 })],
 *   intents: [GatewayIntentBits.GuildVoiceStates],
 * });
 * ```
 */
export function defineConfig(config: ClientConfig): ClientConfig {
	return config;
}

/**
 * 設定ディレクトリを読んで1つの {@link ClientOptions} にまとめます。
 *
 * ディレクトリの中身は {@link collectModuleFiles} の規約で集められます —
 * サブディレクトリも対象、`_` 始まりのファイル・ディレクトリは対象外
 * (共有コードは `config/_env.ts` のように置きます)。各ファイルは
 * {@link ClientConfig} を default export します。
 *
 * 読み込み順は `priority` の降順、同じ値ならパスの昇順です。その順で、
 * キーごとに次の3つの規則で合成します:
 *
 * 1. `plugins` — **連結**。読み込み順に並び、1つのファイル内に並べた
 *    プラグインはその配列順を保ちます。
 * 2. `intents` / `partials` / `applicationGuildIds` — **合併**(union)。
 *    どのファイルも自分が必要なものだけを宣言でき、重複は除かれます。
 * 3. それ以外のキー — **後勝ち**。ただし2つ以上のファイルが同じキーに
 *    **違う値**を書いていたらエラーです(比較は `Object.is`。同じ内容の
 *    オブジェクトリテラルでも別の値なのでエラーになります — どちらが
 *    採用されるか読めない設定は、そもそも書き間違いだからです)。
 *
 * `priority` はローダーが消費するため、結果には残りません。
 *
 * @param directory 設定ディレクトリ。省略時は
 *   `<エントリポイントのディレクトリ>/config`(= `src/index.ts` に対する
 *   `src/config/`)です。コンポーネント自動探索と同じ場所に並ぶので、
 *   Bot のコードは `src/` の下で完結します(`config` という名前のストアは
 *   存在しないため、自動探索と衝突しません)。
 */
export async function loadClientConfig(directory?: string | URL): Promise<ClientOptions> {
	const root = resolveConfigDirectory(directory);
	const paths = await collectModuleFiles(root);

	if (paths.length === 0) {
		throw new ConfigLoadError(
			`設定ディレクトリ ${root} が見つからない、または設定ファイルが1つもありません。` +
				`エントリポイントと同じディレクトリの config/(<エントリポイントのディレクトリ>/config)に置くか、` +
				`createClient("/絶対パス/config") のようにディレクトリを明示してください。`,
			{ path: root },
		);
	}

	const entries: ConfigEntry[] = [];
	for (const path of paths) {
		entries.push(await importConfig(path));
	}

	// priority の降順 → パスの昇順。パスまで比較しておけば、sort の
	// 安定性に頼らずに読み込み順が決まる。
	entries.sort((a, b) => b.priority - a.priority || comparePaths(a.path, b.path));

	return mergeConfigs(entries, root);
}

/**
 * 設定ディレクトリを読んでクライアントを作ります。`load()` はしません —
 * 呼び出し側が `login()`(内部で `load()`)を呼ぶまで、副作用は起きません。
 *
 * ```ts
 * // src/index.ts — エントリポイントはこれだけで済みます。
 * const client = await createClient();
 * await client.login();
 * ```
 *
 * `baseDirectory` は設定の読み込み先とは無関係で、既定どおり
 * エントリポイント(`Bun.main`)のあるディレクトリのままです。設定
 * ディレクトリを別の場所に移してもコンポーネント自動探索は動きます。
 *
 * @param directory {@link loadClientConfig} と同じ。
 * @param overrides ファイルの内容の上に素直に後勝ちで重ねます(衝突検査は
 *   しません)。テストや一時的な上書きのための逃げ道です。**浅い上書きな
 *   ので、合成の規則は適用されません** — `plugins` を渡せば連結済みの配列
 *   ごと、`intents` を渡せば合併済みの値ごと置き換わります。
 */
export async function createClient(
	directory?: string | URL,
	overrides?: Partial<ClientOptions>,
): Promise<Client> {
	const options = await loadClientConfig(directory);
	return new Client({ ...options, ...overrides });
}

/** 設定ファイル1枚の読み込み結果。 */
interface ConfigEntry {
	/** 読み込み元の絶対パス。 */
	readonly path: string;
	/** default export された設定オブジェクト。 */
	readonly config: ClientConfig;
	/** 解決済みの読み込み順(未指定なら 0)。 */
	readonly priority: number;
}

function resolveConfigDirectory(option: string | URL | undefined): string {
	if (option !== undefined) {
		return typeof option === "string" ? resolve(option) : Bun.fileURLToPath(option);
	}
	if (!Bun.main) {
		throw new ConfigLoadError(
			"エントリポイント(Bun.main)が分からないため、設定ディレクトリを推測できません。" +
				'createClient("/絶対パス/config") のようにディレクトリを明示してください。',
		);
	}
	// エントリポイントと同じディレクトリの config/ — `src/index.ts` に対する
	// `src/config/`。コンポーネント種別のディレクトリと同じ並びに置ける。
	return resolve(dirname(Bun.main), "config");
}

async function importConfig(path: string): Promise<ConfigEntry> {
	let module: { default?: unknown };
	try {
		module = (await import(path)) as { default?: unknown };
	} catch (error) {
		throw new ConfigLoadError(`${path} のインポートに失敗しました`, { cause: error, path });
	}

	const config = module.default;
	// クラスインスタンスは Object.entries で getter が拾えず、書いたつもりの
	// 設定が黙って落ちる。プレーンオブジェクトだけを通す。
	if (!isPlainObject(config)) {
		throw new ConfigLoadError(
			`${path} には設定オブジェクトの default export が必要です — ` +
				"export default defineConfig({ ... }) と書いてください。" +
				"設定そのものではない共有コード(環境変数の読み取りなど)は、" +
				'読み込み対象から外れる "_" 始まりのファイル(config/_env.ts など)に置いてください。',
			{ path },
		);
	}

	const priority = (config as ClientConfig).priority;
	if (priority !== undefined && !Number.isFinite(priority)) {
		// NaN は typeof が "number" のまま比較関数を壊す(常に false になり
		// ソート順が不定になる)ので、有限数だけを通す。
		throw new ConfigLoadError(`${path} の priority は有限の数値である必要があります`, { path });
	}

	return { path, config: config as ClientConfig, priority: priority ?? 0 };
}

function mergeConfigs(entries: readonly ConfigEntry[], root: string): ClientOptions {
	const merged: Record<string, unknown> = {};
	// 「後勝ち」キーを最初に書いたファイル。衝突エラーで両方の名前を出す。
	const origins = new Map<string, string>();
	const plugins: Plugin[] = [];
	const intents: NonNullable<ClientOptions["intents"]>[] = [];
	const partials = new Set<Partials>();
	const applicationGuildIds = new Set<string>();

	for (const { path, config } of entries) {
		for (const [key, value] of Object.entries(config)) {
			// 明示的な undefined は「書いていない」と同じ扱い。
			if (value === undefined) continue;

			switch (key) {
				case "priority":
					// ローダーが消費する値。ClientOptions には残さない。
					break;
				case "plugins":
					plugins.push(...(value as readonly Plugin[]));
					break;
				case "intents":
					// discord.js が受け付ける表記はすべて受け付け、あとで
					// IntentsBitField にまとめて合併する。
					intents.push(value as NonNullable<ClientOptions["intents"]>);
					break;
				case "partials":
					// 単体の値を for-of すると素の TypeError になり、文字列なら
					// 黙って1文字ずつに砕ける。配列だけを通す。
					if (!Array.isArray(value)) {
						throw new ConfigLoadError(
							`${path} の partials は配列である必要があります(例: partials: [Partials.Channel])`,
							{ path },
						);
					}
					for (const partial of value as readonly Partials[]) partials.add(partial);
					break;
				case "applicationGuildIds":
					// 文字列は iterable なので、配列を忘れると1文字ずつの
					// 「ギルドID」に砕けて、Discord API の段で初めて謎の失敗になる。
					if (!Array.isArray(value)) {
						throw new ConfigLoadError(
							`${path} の applicationGuildIds は配列である必要があります` +
								`(例: applicationGuildIds: ["${String(value)}"])`,
							{ path },
						);
					}
					for (const id of value as readonly string[]) applicationGuildIds.add(id);
					break;
				default: {
					const origin = origins.get(key);
					if (origin !== undefined && !Object.is(merged[key], value)) {
						throw new ConfigLoadError(
							`設定キー "${key}" が ${origin} と ${path} で衝突しています。` +
								"どちらか一方に寄せてください" +
								"(オブジェクトや関数は同じ内容でも別の値として扱われます)。",
							{ path },
						);
					}
					merged[key] = value;
					if (origin === undefined) origins.set(key, path);
				}
			}
		}
	}

	if (plugins.length > 0) merged.plugins = plugins;
	if (intents.length > 0) merged.intents = new IntentsBitField(intents);
	if (partials.size > 0) merged.partials = [...partials];
	if (applicationGuildIds.size > 0) merged.applicationGuildIds = [...applicationGuildIds];

	// 宣言が1つも無い場合も、`intents: []` ばかりで合併結果が空の場合も、
	// ゲートウェイ接続の段ではなくここで止める。
	if (merged.intents === undefined || (merged.intents as IntentsBitField).bitfield === 0) {
		throw new ConfigLoadError(
			`設定に intents がありません — 少なくとも1つの設定ファイルで、空でない intents を宣言してください。` +
				`読み込んだファイル: ${entries.map((entry) => entry.path).join(", ")}`,
			{ path: root },
		);
	}

	// intents の存在は直前で確認済み。
	return merged as unknown as ClientOptions;
}

/** プレーンオブジェクト(リテラル or Object.create(null))か。 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
	const prototype: unknown = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

function comparePaths(a: string, b: string): number {
	return a < b ? -1 : a > b ? 1 : 0;
}
