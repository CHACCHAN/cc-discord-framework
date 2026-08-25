/**
 * モデル解決の検証。**ネットワークにも API キーにも触りません。**
 *
 * 「入っていないプロバイダー」を確かめるテストは、実在する `@ai-sdk/*` を
 * 相手にしてはいけません — 利用者が1つ `bun add` した時点で前提が崩れます
 * (実際にそれで壊れました)。代わりに {@link missingLoader} を使います。
 */
import { describe, expect, test } from "bun:test";
import { createProviderRegistry, customProvider } from "ai";
import {
	ApiKeyMissingError,
	builtinProviders,
	defaultAiTexts,
	ModelNotConfiguredError,
	ModelResolutionError,
	ModelResolver,
	ProviderNotInstalledError,
} from "../src/index.js";
import { factoryCalls } from "./_fake-provider.js";
import { createAiClient, mockModel } from "./helpers.js";

/** 偽プロバイダーの読み込み方(動的 import の経路を通すため)。 */
const fakeLoader = {
	package: new URL("./_fake-provider.ts", import.meta.url).pathname,
	factory: "createFake",
	apiKeyEnv: "CC_AI_TEST_FAKE_KEY",
	requiresEndpoint: false,
} as const;

/**
 * 絶対に解決できないパッケージを指す読み込み方。
 * 「入っていないときの案内」を、環境に左右されずに確かめるためのものです。
 */
const missingLoader = {
	package: "@cc-discord-framework/this-package-does-not-exist",
	factory: "createGhost",
	apiKeyEnv: null,
	requiresEndpoint: false,
} as const;

function resolver() {
	return new ModelResolver({ providers: {}, registry: null, texts: defaultAiTexts });
}

describe("同梱リゾルバ", () => {
	test("知っているプロバイダーは4つ", () => {
		expect(Object.keys(builtinProviders)).toEqual(["openai", "anthropic", "google", "compatible"]);
		expect(builtinProviders.openai).toEqual({
			package: "@ai-sdk/openai",
			factory: "createOpenAI",
			apiKeyEnv: "OPENAI_API_KEY",
			requiresEndpoint: false,
		});
		expect(builtinProviders.google.apiKeyEnv).toBe("GOOGLE_GENERATIVE_AI_API_KEY");
		expect(builtinProviders.anthropic.apiKeyEnv).toBe("ANTHROPIC_API_KEY");
		expect(builtinProviders.compatible.apiKeyEnv).toBeNull();
	});

	test("LanguageModel はそのまま通す", async () => {
		const model = mockModel("やあ");
		expect(await resolver().resolve(model)).toBe(model);
	});

	test("書式違いは分かるエラーになる", async () => {
		await expect(resolver().resolve("gpt-5")).rejects.toBeInstanceOf(ModelResolutionError);
		await expect(resolver().resolve("gpt-5")).rejects.toThrow(/<プロバイダー>:<モデルID>/);
		await expect(resolver().resolve(":gpt-5")).rejects.toBeInstanceOf(ModelResolutionError);
		await expect(resolver().resolve("openai:")).rejects.toBeInstanceOf(ModelResolutionError);
	});

	test("未知のプロバイダーは選べる候補を教える", async () => {
		await expect(resolver().resolve("ollama:llama3")).rejects.toThrow(
			/openai \/ anthropic \/ google \/ compatible/,
		);
	});

	test("プロバイダー未インストールなら bun add を案内する", async () => {
		const target = new ModelResolver({
			providers: { ghost: { apiKey: "test-key" } },
			registry: null,
			texts: defaultAiTexts,
			loaders: { ghost: missingLoader },
		});
		const error = await target.resolve("ghost:some-model").catch((cause: unknown) => cause);
		expect(error).toBeInstanceOf(ProviderNotInstalledError);
		expect((error as ProviderNotInstalledError).packageName).toBe(missingLoader.package);
		expect((error as Error).message).toContain(`bun add ${missingLoader.package}`);
	});

	test("パッケージの確認は接続先の確認より先(baseURL 不足に隠れない)", async () => {
		const target = new ModelResolver({
			providers: {},
			registry: null,
			texts: defaultAiTexts,
			// baseURL も name も渡していないが、まず入っていないことを言うべき。
			loaders: { ghost: { ...missingLoader, requiresEndpoint: true } },
		});
		await expect(target.resolve("ghost:some-model")).rejects.toBeInstanceOf(
			ProviderNotInstalledError,
		);
	});

	test("文言は差し替えられる", async () => {
		const target = new ModelResolver({
			providers: {},
			registry: null,
			texts: {
				...defaultAiTexts,
				providerNotInstalled: (provider, packageName) => `${provider}/${packageName} が無い`,
				apiKeyMissing: () => "鍵が無い",
			},
			loaders: { ghost: missingLoader },
		});
		await expect(target.resolve("ghost:some-model")).rejects.toThrow(
			`ghost/${missingLoader.package} が無い`,
		);
	});
});

describe("providerLoaders(プロバイダーを足す)", () => {
	test("足したプロバイダーが文字列で使えるようになる", async () => {
		factoryCalls.length = 0;
		const client = createAiClient({
			model: "fake:my-model",
			providerLoaders: { fake: fakeLoader },
			providers: { fake: { apiKey: "test-key", name: "偽" } },
		});
		await client.load();

		expect(await client.container.services.ai.ask("やあ")).toBe("偽:my-model");
		// 設定はそのままファクトリへ渡る。
		expect(factoryCalls).toEqual([{ apiKey: "test-key", name: "偽" }]);

		// 2回目はキャッシュされたプロバイダーが使われる(ファクトリは1度だけ)。
		await client.container.services.ai.ask("もう一度");
		expect(factoryCalls.length).toBe(1);
		await client.destroy();
	});

	test("API キーが無ければ環境変数名を教える", async () => {
		const client = createAiClient({
			model: "fake:my-model",
			providerLoaders: { fake: fakeLoader },
		});
		await client.load();

		const error = await client.container.services.ai.model().catch((cause: unknown) => cause);
		expect(error).toBeInstanceOf(ApiKeyMissingError);
		expect((error as Error).message).toContain("CC_AI_TEST_FAKE_KEY");
		await client.destroy();
	});

	test("同梱の表は消えず、足した分だけ増える", async () => {
		const client = createAiClient({ providerLoaders: { fake: fakeLoader } });
		await client.load();
		expect(Object.keys(client.container.aiConfig.providerLoaders).sort()).toEqual(
			["anthropic", "compatible", "fake", "google", "openai"],
		);
		// 既定の表そのものは汚れていない。
		expect(Object.keys(builtinProviders)).toEqual([
			"openai",
			"anthropic",
			"google",
			"compatible",
		]);
		await client.destroy();
	});

	test("同名を指定すれば同梱の定義を差し替えられる", async () => {
		factoryCalls.length = 0;
		const client = createAiClient({
			model: "openai:my-model",
			providerLoaders: { openai: fakeLoader },
			providers: { openai: { apiKey: "k", name: "差し替え" } },
		});
		await client.load();
		expect(await client.container.services.ai.ask("やあ")).toBe("差し替え:my-model");
		await client.destroy();
	});
});

describe("compatible の設定不足", () => {
	test("baseURL / name が無ければ何を書けばよいか教える", async () => {
		// 同梱の compatible はパッケージが無いので、偽の読み込み方で
		// 「接続先が必須」の枝だけを確かめる。
		const target = new ModelResolver({
			providers: {},
			registry: null,
			texts: defaultAiTexts,
			loaders: { compatible: { ...fakeLoader, apiKeyEnv: null, requiresEndpoint: true } },
		});
		await expect(target.resolve("compatible:llama3.2")).rejects.toThrow(
			/providers: \{ compatible/,
		);
	});

	test("baseURL と name があれば通る", async () => {
		const target = new ModelResolver({
			providers: { compatible: { name: "ollama", baseURL: "http://localhost:11434/v1" } },
			registry: null,
			texts: defaultAiTexts,
			loaders: { compatible: { ...fakeLoader, apiKeyEnv: null, requiresEndpoint: true } },
		});
		expect(await target.resolve("compatible:llama3.2")).toBeDefined();
	});
});

describe("レジストリ", () => {
	test("registry を渡すと文字列はそちらで解決される", async () => {
		const model = mockModel("レジストリ経由");
		const registry = createProviderRegistry({
			mine: customProvider({ languageModels: { fast: model } }),
		});
		const target = new ModelResolver({ providers: {}, registry, texts: defaultAiTexts });

		// 同梱リゾルバの名前空間ではなくレジストリが使われる。
		expect(await target.resolve("mine:fast")).toBeDefined();
		const client = createAiClient({ registry, model: "mine:fast" });
		await client.load();
		expect(await client.container.services.ai.ask("やあ")).toBe("レジストリ経由");
		await client.destroy();
	});
});

describe("AiService.model", () => {
	test("未設定なら設定を促すエラー", async () => {
		const client = createAiClient();
		await client.load();
		await expect(client.container.services.ai.model()).rejects.toBeInstanceOf(
			ModelNotConfiguredError,
		);
		await expect(client.container.services.ai.model()).rejects.toThrow(/ai\(\{ model/);
		await client.destroy();
	});

	test("既定を設定しておけばそれが使われ、引数が優先される", async () => {
		const fallback = mockModel("既定");
		const explicit = mockModel("明示");
		const client = createAiClient({ model: fallback });
		await client.load();

		expect(await client.container.services.ai.model()).toBe(fallback);
		expect(await client.container.services.ai.model(explicit)).toBe(explicit);
		await client.destroy();
	});

	test("文言を差し替えると未設定エラーの文言も変わる", async () => {
		const client = createAiClient({ texts: { modelNotConfigured: "モデル未設定" } });
		await client.load();
		await expect(client.container.services.ai.model()).rejects.toThrow("モデル未設定");
		await client.destroy();
	});
});
