/**
 * 生成が失敗したときに **本当の原因がユーザーへ届くか**。
 *
 * AI SDK v7 は失敗を `textStream` へ流しません(`onError` と `fullStream` の
 * error パートにだけ流します)。1断片も出ないまま失敗すると結果の Promise が
 * cause を持たない `NoOutputGeneratedError` で reject するため、拾わないと
 * 「401 Unauthorized」が「No output generated.」に化けます。
 */
import { describe, expect, test } from "bun:test";
import { APICallError } from "ai";
import { z } from "zod";
import { AiEvents, AiTool } from "../src/index.js";
import {
	bodyOf,
	createAiClient,
	fakeInteraction,
	fakeLogger,
	mockApiErrorModel,
	mockPartialErrorModel,
	mockSilentModel,
	mockStreamModel,
} from "./helpers.js";

@AiTool.define({ description: "そのまま返します。", inputSchema: z.object({}) })
class EchoTool extends AiTool<Record<string, never>> {
	override execute() {
		return "echo";
	}
}

describe("HTTP エラー", () => {
	test("ストリーミングでも本当の原因が表示される", async () => {
		const client = createAiClient({
			model: mockApiErrorModel(401, "Unauthorized"),
			display: { embeds: false },
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "やあ",
		});

		const body = bodyOf(edits.at(-1));
		expect(body).toContain("Unauthorized");
		expect(body).toContain("401");
		// これが出ていたら、原因を取り戻せていない。
		expect(body).not.toContain("No output generated");
		expect(APICallError.isInstance(result.error)).toBe(true);
		await client.destroy();
	});

	test("非ストリーミングでもステータスコードが添えられる", async () => {
		const client = createAiClient({
			model: mockApiErrorModel(429, "Too Many Requests"),
			stream: { enabled: false },
			display: { embeds: false },
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(bodyOf(edits.at(-1))).toContain("HTTP 429");
		await client.destroy();
	});

	test("aiError には元の APICallError がそのまま流れる", async () => {
		const client = createAiClient({ model: mockApiErrorModel(401, "Unauthorized") });
		await client.load();
		const seen: unknown[] = [];
		client.on(AiEvents.Error, (error) => seen.push(error));
		const { interaction } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(seen).toHaveLength(1);
		expect(APICallError.isInstance(seen[0])).toBe(true);
		expect((seen[0] as APICallError).statusCode).toBe(401);
		await client.destroy();
	});

	test("apiCallFailed は差し替えられる", async () => {
		const client = createAiClient({
			model: mockApiErrorModel(401, "Unauthorized"),
			display: { embeds: false },
			texts: {
				apiCallFailed: (status, message) =>
					status === 401 ? "APIキーを確認してください。" : message,
			},
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		const body = bodyOf(edits.at(-1));
		expect(body).toContain("APIキーを確認してください。");
		expect(body).not.toContain("HTTP 401");
		await client.destroy();
	});
});

describe("本文が出たあとの失敗", () => {
	test("回答は残しつつ、失敗はログとイベントへ出す", async () => {
		const client = createAiClient({
			model: mockPartialErrorModel(["途中まで"], new Error("あとで壊れた")),
			display: { embeds: false },
			stream: { intervalMs: 0 },
		});
		await client.load();
		const seen: unknown[] = [];
		client.on(AiEvents.Error, (error) => seen.push(error));
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "やあ",
		});

		// 出ていた回答は捨てない。
		expect(result.text).toBe("途中まで");
		expect(bodyOf(edits.at(-1))).toContain("途中まで");
		// でも失敗は黙って捨てない。
		expect(seen).toHaveLength(1);
		expect((seen[0] as Error).message).toBe("あとで壊れた");
		await client.destroy();
	});
});

describe("stream() の失敗", () => {
	test("薄いラッパでも aiError に出る(呼び出し側が気づけないまま消さない)", async () => {
		const client = createAiClient({ model: mockApiErrorModel(500, "Internal Server Error") });
		await client.load();
		const seen: unknown[] = [];
		client.on(AiEvents.Error, (error) => seen.push(error));

		const result = await client.container.services.ai.stream({ prompt: "やあ" });
		// textStream は静かに終わる(v7 は失敗をここへ流さない)。
		let text = "";
		for await (const delta of result.textStream) text += delta;
		expect(text).toBe("");

		expect(seen).toHaveLength(1);
		expect(APICallError.isInstance(seen[0])).toBe(true);
		await client.destroy();
	});
});

describe("本文が空のとき", () => {
	test("ツールを渡していたことがログに残る(空応答の切り分けができる)", async () => {
		const logger = fakeLogger();
		const client = createAiClient({ model: mockSilentModel(), display: { embeds: false } }, logger);
		client.register(EchoTool);
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "やあ",
		});

		// ユーザーへの文言は変わらない(差し替え可能な texts のまま)。
		expect(result.text).toBe("応答がありませんでした。");
		expect(bodyOf(edits.at(-1))).toBe("応答がありませんでした。");

		// が、原因を追える事実はログに出す。
		const warned = logger.warnings.at(-1);
		expect(String(warned?.[1])).toContain("ツールを渡しています");
		expect(warned?.[0]).toMatchObject({ toolCount: 1, streaming: true });
		await client.destroy();
	});

	test("ツールを渡していなければ、その旨は書かない", async () => {
		const logger = fakeLogger();
		const client = createAiClient(
			{ model: mockSilentModel(), tools: { enabled: false } },
			logger,
		);
		client.register(EchoTool);
		await client.load();
		const { interaction } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		const warned = logger.warnings.at(-1);
		expect(String(warned?.[1])).not.toContain("ツールを渡しています");
		expect(warned?.[0]).toMatchObject({ toolCount: 0 });
		await client.destroy();
	});

	test("本文が返っていれば警告は出ない", async () => {
		const logger = fakeLogger();
		const client = createAiClient({ model: mockStreamModel(["やあ"]) }, logger);
		await client.load();
		const { interaction } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(logger.warnings).toHaveLength(0);
		await client.destroy();
	});
});
