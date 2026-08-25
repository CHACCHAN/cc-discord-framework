/**
 * イベントと「リスナーが1人もいなければ既定動作」のパターンの検証。
 */
import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { AiEvents, AiTool, reportAiError, type AiErrorInfo } from "../src/index.js";
import { createAiClient, fakeLogger, mockToolCallingModel } from "./helpers.js";

@AiTool.define({ description: "必ず失敗します。", inputSchema: z.object({}) })
class BoomTool extends AiTool<Record<string, never>> {
	override execute(): never {
		throw new Error("壊れた");
	}
}

describe("イベント名", () => {
	test("4つそろっている", () => {
		expect(AiEvents).toEqual({
			Request: "aiRequest",
			Response: "aiResponse",
			ToolCall: "aiToolCall",
			Error: "aiError",
		});
	});
});

describe("aiError の既定動作", () => {
	const info: AiErrorInfo = {
		phase: "generate",
		channelId: "c1",
		userId: "u1",
		guildId: "g1",
		tool: null,
	};

	test("誰も購読していなければログへ残す", async () => {
		const logger = fakeLogger();
		const client = createAiClient({}, logger);
		await client.load();

		reportAiError(client, logger as never, new Error("壊れた"), info);
		expect(logger.errors.length).toBe(1);
		expect(logger.errors[0]?.[1]).toBe("AI の処理でエラーが発生しました");
		await client.destroy();
	});

	test("リスナーが1人でもいれば既定動作は走らない", async () => {
		const logger = fakeLogger();
		const client = createAiClient({}, logger);
		await client.load();
		const seen: AiErrorInfo[] = [];
		client.on(AiEvents.Error, (_error, received) => seen.push(received));

		reportAiError(client, logger as never, new Error("壊れた"), info);
		expect(seen).toEqual([info]);
		expect(logger.errors.length).toBe(0);
		await client.destroy();
	});

	test("ツールの失敗もこのパターンを通る", async () => {
		const logger = fakeLogger();
		const client = createAiClient({ model: mockToolCallingModel("boom", {}, "はい") }, logger);
		client.register(BoomTool);
		await client.load();

		await client.container.services.ai.generate({ prompt: "呼んで" });
		// ツール自身のログ(1件)と、既定動作のログ(1件)。
		expect(logger.errors.length).toBe(2);
		await client.destroy();
	});

	test("ツールの失敗を購読すれば既定動作のログは出ない", async () => {
		const logger = fakeLogger();
		const client = createAiClient({ model: mockToolCallingModel("boom", {}, "はい") }, logger);
		client.register(BoomTool);
		await client.load();
		client.on(AiEvents.Error, () => undefined);

		await client.container.services.ai.generate({ prompt: "呼んで" });
		// ツール自身のログだけが残る。
		expect(logger.errors.length).toBe(1);
		expect(logger.errors[0]?.[1]).toBe("AI ツールの実行に失敗しました");
		await client.destroy();
	});
});
