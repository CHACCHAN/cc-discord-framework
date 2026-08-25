/**
 * 動的 import の経路をテストするための偽プロバイダーパッケージ。
 *
 * `@ai-sdk/*` はどれも入れていないので(optional peer のまま)、
 * 「読み込みに成功したときの経路」を確かめる相手がありません。
 * このファイルを `providerLoaders` の `package` に指定して代わりにします。
 *
 * ファイル名が `_` で始まるので、コンポーネントとして読み込まれることは
 * ありません。
 */
import type { LanguageModel } from "ai";
import { MockLanguageModelV3 } from "ai/test";
import { finish, usage } from "./helpers.js";

/** ファクトリが受け取った設定(検証用)。 */
export const factoryCalls: Record<string, unknown>[] = [];

/** `createOpenAI` などと同じ形のファクトリ。 */
export function createFake(settings: Record<string, unknown>) {
	factoryCalls.push(settings);
	const provider = (modelId: string): LanguageModel =>
		new MockLanguageModelV3({
			modelId,
			doGenerate: async () => ({
				content: [{ type: "text", text: `${String(settings.name ?? "fake")}:${modelId}` }],
				finishReason: finish("stop"),
				usage: usage(1, 1),
				warnings: [],
			}),
		});
	return Object.assign(provider, { languageModel: provider });
}
