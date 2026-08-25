/**
 * `timeout` が **どの経路でも** 効くことの検証。
 *
 * ここのテストは意図して「実経路」を踏みます — AI SDK v7 のタイムアウトは
 * `AbortSignal.timeout()` による **graceful abort** なので、
 * `doStream` が同期 throw する偽モデルでは再現できません。ストリーミングでは
 * `textStream` が静かに終わり、例外は `result.usage` などの await から出ます。
 *
 * どの項目も「差し替えれば変わる」「指定しなければ既定のまま」を対で
 * 確かめています。**ネットワークにも API キーにも触りません。**
 */
import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { AiEvents, AiTimeoutError, defaultAiTexts } from "../src/index.js";
import {
	bodyOf,
	createAiClient,
	fakeInteraction,
	mockSlowModel,
	mockStallingStreamModel,
	mockStreamModel,
} from "./helpers.js";

describe("generate(): 実経路", () => {
	test("timeout を過ぎると差し替え可能な文言の AiTimeoutError になる", async () => {
		const client = createAiClient({
			model: mockSlowModel(2_000),
			timeout: 40,
			texts: { timedOut: (ms) => `TO:${ms}` },
		});
		await client.load();

		const started = Date.now();
		const error = await client.container.services.ai.ask("おそい?").catch((cause: unknown) => cause);
		expect(error).toBeInstanceOf(AiTimeoutError);
		expect((error as Error).message).toBe("TO:40");
		// 本当に打ち切っている(2秒待っていない)。
		expect(Date.now() - started).toBeLessThan(1_000);
		await client.destroy();
	});

	test("timeout に間に合えば普通に返る", async () => {
		const client = createAiClient({ model: mockSlowModel(10, "はやい"), timeout: 2_000 });
		await client.load();
		expect(await client.container.services.ai.ask("はやい?")).toBe("はやい");
		await client.destroy();
	});
});

describe("object(): 実経路", () => {
	// ai v7 の `generateObject` は `timeout` を受け取らない
	// (`Omit<RequestOptions, "timeout">`)ので、プラグイン側が
	// `AbortSignal.timeout()` を作って渡している。
	test("timeout を過ぎると打ち切られ、差し替えた文言になる", async () => {
		const client = createAiClient({
			model: mockSlowModel(2_000, '{"a":1}'),
			timeout: 40,
			texts: { timedOut: (ms) => `TO:${ms}` },
		});
		await client.load();

		const started = Date.now();
		const error = await client.container.services.ai
			.object(z.object({ a: z.number() }), "数")
			.catch((cause: unknown) => cause);
		expect(error).toBeInstanceOf(AiTimeoutError);
		expect((error as Error).message).toBe("TO:40");
		expect(Date.now() - started).toBeLessThan(1_000);
		await client.destroy();
	});

	test("timeout: false なら打ち切らない", async () => {
		const client = createAiClient({ model: mockSlowModel(30, '{"a":1}'), timeout: false });
		await client.load();
		expect(await client.container.services.ai.object(z.object({ a: z.number() }), "数")).toEqual({
			a: 1,
		});
		await client.destroy();
	});

	test("呼び出しごとの timeout が設定より優先される", async () => {
		const client = createAiClient({ model: mockSlowModel(2_000, '{"a":1}'), timeout: false });
		await client.load();

		const error = await client.container.services.ai
			.object(z.object({ a: z.number() }), "数", { timeout: 40 })
			.catch((cause: unknown) => cause);
		expect(error).toBeInstanceOf(AiTimeoutError);
		await client.destroy();
	});

	test("呼び出し側が中断した場合はタイムアウト扱いにしない", async () => {
		const client = createAiClient({ model: mockSlowModel(2_000, '{"a":1}'), timeout: 5_000 });
		await client.load();
		const controller = new AbortController();
		setTimeout(() => controller.abort(), 20);

		const error = await client.container.services.ai
			.object(z.object({ a: z.number() }), "数", { abortSignal: controller.signal })
			.catch((cause: unknown) => cause);
		expect(error).not.toBeNull();
		expect(error).not.toBeInstanceOf(AiTimeoutError);
		await client.destroy();
	});
});

describe("reply(streaming): 実経路", () => {
	test("graceful abort でも texts.timedOut が使われる", async () => {
		const client = createAiClient({
			model: mockStallingStreamModel(["あ", "い", "う"], 5),
			display: { embeds: false },
			stream: { intervalMs: 5 },
			timeout: 120,
			texts: {
				timedOut: (ms) => `TIMED_OUT:${ms}`,
				generationFailed: (message) => `FAILED:${message}`,
			},
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "おそい",
		});

		expect(result.error).toBeInstanceOf(AiTimeoutError);
		expect(bodyOf(edits.at(-1))).toBe("FAILED:TIMED_OUT:120");
		// 生成できていた分は捨てられず result.text に残る。
		expect(result.text).toBe("あいう");
		await client.destroy();
	});

	test("文言を差し替えなければ既定のタイムアウト文言が出る", async () => {
		const client = createAiClient({
			model: mockStallingStreamModel(["あ"], 5),
			display: { embeds: false },
			stream: { intervalMs: 5 },
			timeout: 120,
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "おそい" });
		expect(bodyOf(edits.at(-1))).toBe(
			defaultAiTexts.generationFailed(defaultAiTexts.timedOut(120)),
		);
		await client.destroy();
	});

	test("timeout に間に合えば普通に完走する(#run() が成功経路を壊していない)", async () => {
		const client = createAiClient({
			model: mockStreamModel(["あ", "い"], 1),
			display: { embeds: false },
			stream: { intervalMs: 5 },
			timeout: 3_000,
		});
		await client.load();
		const { interaction } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "まにあう",
		});
		expect(result.error).toBeNull();
		expect(result.text).toBe("あい");
		// usage / finishReason も #run() 越しにちゃんと取れている。
		expect(result.finishReason).not.toBeNull();
		expect(result.usage).not.toBeNull();
		await client.destroy();
	});
});
