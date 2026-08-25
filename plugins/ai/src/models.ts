/**
 * モデル指定の解決。
 *
 * 受け取れるのは3通りです:
 *
 * ```ts
 * ai({ model: "openai:gpt-5" })                   // 文字列 → 同梱リゾルバ
 * ai({ model: openai("gpt-5") })                  // LanguageModel をそのまま
 * ai({ registry, model: "myns:fast" })            // 自前のレジストリ
 * ```
 *
 * # プロバイダーのパッケージは静的 import しません
 *
 * `@ai-sdk/*` は optional peer dependency です。**静的に import すると、
 * 使っていないプロバイダーが入っていないだけで起動が落ちます。**
 * そのため文字列で名指しされたときにだけ動的 import し、失敗したら
 * 「`bun add ...` してください」と分かる {@link ProviderNotInstalledError}
 * を投げます。
 */
import type { LanguageModel } from "ai";
import {
	ApiKeyMissingError,
	ModelResolutionError,
	ProviderNotInstalledError,
} from "./errors.js";
import type { AiTexts } from "./texts.js";

/** 呼び出し側が渡せるモデル指定。 */
export type AiModelInput = string | LanguageModel;

/**
 * 自前のプロバイダーレジストリ。`ai` の `createProviderRegistry()` が
 * 返すものがそのまま入ります(必要な口はモデル解決だけなので、
 * ここでは最小限の形だけを要求します)。
 */
export interface AiRegistry {
	languageModel(id: string): LanguageModel;
}

/** プロバイダーへ渡す接続設定。各 SDK の `create*()` にそのまま渡されます。 */
export interface AiProviderSettings {
	/** API キー。省略すると各 SDK の既定の環境変数が使われます。 */
	readonly apiKey?: string;
	/** 接続先。`compatible` では必須です。 */
	readonly baseURL?: string;
	/** 追加の HTTP ヘッダー。 */
	readonly headers?: Record<string, string>;
	/** プロバイダー名(`compatible` では必須。ログや provider metadata に出ます)。 */
	readonly name?: string;
}

/** 同梱リゾルバが解決できるプロバイダー。 */
export type AiProviderName = "openai" | "anthropic" | "google" | "compatible";

/**
 * プロバイダーごとの接続設定。
 * `providerLoaders` で足したプロバイダーの設定もここへ書きます。
 */
export interface AiProviders {
	readonly openai?: AiProviderSettings;
	readonly anthropic?: AiProviderSettings;
	readonly google?: AiProviderSettings;
	readonly compatible?: AiProviderSettings;
	/** `providerLoaders` で足したプロバイダーの設定。 */
	readonly [name: string]: AiProviderSettings | undefined;
}

/** プロバイダーの読み込み方。`ai({ providerLoaders })` で足せます。 */
export interface AiProviderLoader {
	/** 動的 import するパッケージ名。 */
	readonly package: string;
	/** そのパッケージが export しているファクトリ関数の名前。 */
	readonly factory: string;
	/**
	 * その SDK が既定で読む API キーの環境変数名。
	 * `null` なら API キーを要求しません。
	 */
	readonly apiKeyEnv: string | null;
	/** `baseURL` と `name` の指定が必須か。 */
	readonly requiresEndpoint: boolean;
}

/**
 * 同梱リゾルバが最初から知っているプロバイダー。
 *
 * **ここに無いプロバイダーも足せます** — `ai({ providerLoaders })` に
 * 同じ形で書けば、そのプロバイダーも文字列で指定できるようになります。
 *
 * ```ts
 * ai({
 *   model: "groq:llama-3.3-70b-versatile",
 *   providerLoaders: {
 *     groq: {
 *       package: "@ai-sdk/groq",
 *       factory: "createGroq",
 *       apiKeyEnv: "GROQ_API_KEY",
 *       requiresEndpoint: false,
 *     },
 *   },
 * })
 * ```
 *
 * OpenAI 互換 API(Ollama / LM Studio / vLLM / llama.cpp / OpenRouter)は
 * `compatible` から使えます。もっと自由に組みたい場合は
 * `ai({ registry })` に自前のレジストリを渡してください。
 */
export const builtinProviders: Readonly<Record<AiProviderName, AiProviderLoader>> = {
	openai: {
		package: "@ai-sdk/openai",
		factory: "createOpenAI",
		apiKeyEnv: "OPENAI_API_KEY",
		requiresEndpoint: false,
	},
	anthropic: {
		package: "@ai-sdk/anthropic",
		factory: "createAnthropic",
		apiKeyEnv: "ANTHROPIC_API_KEY",
		requiresEndpoint: false,
	},
	google: {
		package: "@ai-sdk/google",
		factory: "createGoogleGenerativeAI",
		apiKeyEnv: "GOOGLE_GENERATIVE_AI_API_KEY",
		requiresEndpoint: false,
	},
	compatible: {
		package: "@ai-sdk/openai-compatible",
		factory: "createOpenAICompatible",
		apiKeyEnv: null,
		requiresEndpoint: true,
	},
};

/** 動的 import したプロバイダーに要求する形。 */
interface LoadedProvider {
	(modelId: string): LanguageModel;
	languageModel?(modelId: string): LanguageModel;
}

/** {@link ModelResolver} の依存。 */
export interface ModelResolverOptions {
	/** プロバイダーごとの接続設定。 */
	readonly providers: AiProviders;
	/** 自前のレジストリ。指定するとすべての文字列がこれで解決されます。 */
	readonly registry: AiRegistry | null;
	/** エラー文言。 */
	readonly texts: AiTexts;
	/**
	 * プロバイダーの読み込み方。省略すると {@link builtinProviders}。
	 * 足したい・差し替えたい場合は `ai({ providerLoaders })` を使ってください
	 * (プラグインがここへ渡します)。
	 */
	readonly loaders?: Readonly<Record<string, AiProviderLoader>>;
}

/**
 * 文字列のモデル指定を {@link LanguageModel} へ解決します。
 * 生成したプロバイダーはインスタンス内にキャッシュされるため、
 * 動的 import とファクトリ呼び出しはプロバイダーごとに1度だけです。
 *
 * クライアントごとに1つ持たせてください(モジュールレベルの共有状態を
 * 作らないため、{@link AiService} が保持します)。
 */
export class ModelResolver {
	readonly #options: ModelResolverOptions;
	readonly #loaders: Readonly<Record<string, AiProviderLoader>>;
	readonly #providers = new Map<string, LoadedProvider>();

	public constructor(options: ModelResolverOptions) {
		this.#options = options;
		this.#loaders = options.loaders ?? builtinProviders;
	}

	/**
	 * モデル指定を解決します。文字列以外はそのまま返します
	 * (すでに `LanguageModel` なので解決するものがありません)。
	 */
	public async resolve(input: AiModelInput): Promise<LanguageModel> {
		if (typeof input !== "string") return input;

		const { registry, texts } = this.#options;
		// レジストリを渡されているなら、文字列の解釈はすべてそちらに任せる
		// (同梱リゾルバと二重に解決して食い違わないように)。
		if (registry) return registry.languageModel(input);

		const separator = input.indexOf(":");
		if (separator <= 0 || separator === input.length - 1) {
			throw new ModelResolutionError(texts.modelIdInvalid(input), { model: input });
		}
		const name = input.slice(0, separator);
		const modelId = input.slice(separator + 1);

		const loader = this.#loaders[name];
		if (!loader) {
			throw new ModelResolutionError(texts.providerUnknown(name, Object.keys(this.#loaders)), {
				provider: name,
			});
		}

		const provider = await this.#provider(name, loader);
		return typeof provider.languageModel === "function"
			? provider.languageModel(modelId)
			: provider(modelId);
	}

	async #provider(name: string, loader: AiProviderLoader): Promise<LoadedProvider> {
		const cached = this.#providers.get(name);
		if (cached) return cached;

		const { providers, texts } = this.#options;
		const settings = providers[name] ?? {};

		// 1) パッケージ。入っていなければ何もできないので最初に確かめる。
		let module: Record<string, unknown>;
		try {
			module = (await import(loader.package)) as Record<string, unknown>;
		} catch (error) {
			throw new ProviderNotInstalledError(
				texts.providerNotInstalled(name, loader.package),
				name,
				loader.package,
				error,
			);
		}

		const factory = module[loader.factory];
		if (typeof factory !== "function") {
			throw new ProviderNotInstalledError(
				texts.providerNotInstalled(name, loader.package),
				name,
				loader.package,
			);
		}

		// 2) 接続先(compatible のみ必須)。
		if (loader.requiresEndpoint && (!settings.baseURL || !settings.name)) {
			throw new ModelResolutionError(texts.compatibleNotConfigured, { provider: name });
		}

		// 3) API キー。SDK の既定の環境変数もここで確かめるので、
		//    「キーが無い」ことが呼び出し前に分かる。
		if (loader.apiKeyEnv !== null && !settings.apiKey && !Bun.env[loader.apiKeyEnv]) {
			throw new ApiKeyMissingError(
				texts.apiKeyMissing(name, loader.apiKeyEnv),
				name,
				loader.apiKeyEnv,
			);
		}

		const provider = (factory as (settings: AiProviderSettings) => LoadedProvider)(settings);
		this.#providers.set(name, provider);
		return provider;
	}
}
