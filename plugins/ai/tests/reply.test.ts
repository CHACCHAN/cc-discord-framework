/**
 * Discord へのストリーミング表示の検証。
 *
 * **ネットワークにも API キーにも触りません** — 偽のインタラクションへ
 * 送られたペイロードを数えて、間引き・分割・見せ方を確かめます。
 */
import { describe, expect, test } from "bun:test";
import { MessageFlags, type EmbedBuilder } from "@cc-discord-framework/core";
import { z } from "zod";
import {
	AiEvents,
	AiTimeoutError,
	AiTool,
	CooldownError,
	defaultAiTexts,
	ModelNotConfiguredError,
	PromptTooLongError,
	type AiErrorInfo,
	type AiOptions,
	type AiPayloadContext,
} from "../src/index.js";
import {
	bodyOf,
	createAiClient,
	fakeInteraction,
	mockFailingModel,
	mockManualFailingModel,
	mockModel,
	mockPartialErrorModel,
	mockRepeatToolModel,
	mockSourceModel,
	mockStreamErrorModel,
	mockTimingOutModel,
	mockStreamModel,
	mockToolCallingModel,
} from "./helpers.js";

@AiTool.define({ description: "名前を返します。", inputSchema: z.object({}) })
class PingTool extends AiTool<Record<string, never>> {
	override execute() {
		return "ぽん";
	}
}

describe("ストリーミング表示", () => {
	test("間隔どおりに間引かれる", async () => {
		// 30ms ごとに10断片 = 約300ms。100ms 間隔なら数回しか撃たない。
		const client = createAiClient({
			model: mockStreamModel(Array.from({ length: 10 }, (_, i) => String(i)), 30),
			stream: { intervalMs: 100 },
		});
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "数えて",
		});
		expect(result.text).toBe("0123456789");
		// 最終の1回を含めても断片の数より明らかに少ない。
		expect(result.edits).toBeLessThanOrEqual(5);
		expect(result.edits).toBe(edits.length);
		expect(bodyOf(edits.at(-1))).toBe("0123456789");
		// 同じ本文を2度送っていない(コアレスが効いている)。
		expect(new Set(edits.map(bodyOf)).size).toBe(edits.length);
		await client.destroy();
	});

	test("間隔を短くすれば編集回数は増える", async () => {
		const chunks = Array.from({ length: 10 }, (_, i) => String(i));
		const slow = createAiClient({
			model: mockStreamModel(chunks, 30),
			stream: { intervalMs: 1_000 },
		});
		const fast = createAiClient({ model: mockStreamModel(chunks, 30), stream: { intervalMs: 0 } });
		await slow.load();
		await fast.load();

		const slowResult = await slow.container.services.ai.reply(
			fakeInteraction(slow).interaction as never,
			{ prompt: "数えて" },
		);
		const fastResult = await fast.container.services.ai.reply(
			fakeInteraction(fast).interaction as never,
			{ prompt: "数えて" },
		);
		// 1秒間隔だと「最初の1回」と「最終の1回」だけになる。
		expect(slowResult.edits).toBe(2);
		expect(fastResult.edits).toBeGreaterThan(slowResult.edits);
		await slow.destroy();
		await fast.destroy();
	});

	test("編集が飛行中なら次を撃たない(同時に2つ飛ばさない)", async () => {
		// 編集に 80ms かかるのに断片は 10ms ごとに来る状況。
		// コアレスできていないと編集が重なって積み上がる。
		const client = createAiClient({
			model: mockStreamModel(Array.from({ length: 20 }, (_, i) => String(i)), 10),
			stream: { intervalMs: 0 },
		});
		await client.load();
		const { interaction, flight, edits } = fakeInteraction(client, { editDelay: 80 });

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "数えて",
		});
		expect(flight.max).toBe(1);
		expect(flight.current).toBe(0);
		// 断片20個に対して編集はごく少数(飛行中は撃たないため)。
		expect(result.edits).toBeLessThan(10);
		expect(bodyOf(edits.at(-1))).toBe("012345678910111213141516171819");
		await client.destroy();
	});

	test("途中はカーソルが付き、最後は外れる", async () => {
		const client = createAiClient({
			model: mockStreamModel(["あ", "い", "う"], 30),
			stream: { intervalMs: 0 },
		});
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		const bodies = edits.map(bodyOf);
		expect(bodies.slice(0, -1).every((body) => body.endsWith("▌"))).toBe(true);
		expect(bodies.at(-1)).toBe("あいう");
		await client.destroy();
	});

	test("カーソルは差し替えられる / 空文字なら付かない", async () => {
		const custom = createAiClient({
			model: mockStreamModel(["あ", "い"], 30),
			stream: { intervalMs: 0, cursor: "…" },
		});
		const none = createAiClient({
			model: mockStreamModel(["あ", "い"], 30),
			stream: { intervalMs: 0, cursor: "" },
		});
		await custom.load();
		await none.load();

		const a = fakeInteraction(custom);
		await custom.container.services.ai.reply(a.interaction as never, { prompt: "やあ" });
		expect(a.edits.map(bodyOf).slice(0, -1).some((body) => body.endsWith("…"))).toBe(true);

		const b = fakeInteraction(none);
		await none.container.services.ai.reply(b.interaction as never, { prompt: "やあ" });
		expect(b.edits.map(bodyOf).every((body) => !body.includes("▌"))).toBe(true);
		await custom.destroy();
		await none.destroy();
	});

	test("同じ内容なら撃たない", async () => {
		// 空文字の断片が続いても本文は変わらないので、途中経過は撃たれない。
		const client = createAiClient({
			model: mockStreamModel(["", "", "", "最後"], 30),
			stream: { intervalMs: 0 },
		});
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "やあ",
		});
		expect(result.text).toBe("最後");
		// 4断片あっても、本文が変わらない分は撃たれない。
		expect(result.edits).toBeLessThanOrEqual(2);
		// 同じ本文を2度送っていない。
		expect(new Set(edits.map(bodyOf)).size).toBe(edits.length);
		await client.destroy();
	});

	test("本文が変わらないあいだは撃たない(answerBody が同じ文字列を返す場合)", async () => {
		const client = createAiClient({
			model: mockStreamModel(["あ", "い", "う", "え", "お"], 30),
			stream: { intervalMs: 0 },
			display: { embeds: false },
			// どれだけ増えても本文は変わらない = 送り直す理由がない。
			texts: { answerBody: () => "固定" },
		});
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "やあ",
		});
		// 途中経過の1回と最終の1回だけ。
		expect(result.edits).toBeLessThanOrEqual(2);
		expect(edits.every((payload) => payload.content === "固定")).toBe(true);
		await client.destroy();
	});

	test("編集が失敗したら途中経過を撃ち続けない", async () => {
		const client = createAiClient({
			model: mockStreamModel(Array.from({ length: 10 }, (_, i) => String(i)), 20),
			stream: { intervalMs: 0 },
		});
		await client.load();
		// 表示の失敗は aiError へ流れる(既定動作のログを止めるため購読する)。
		client.on(AiEvents.Error, () => undefined);
		const { interaction, attempts } = fakeInteraction(client, { failEdits: true });

		await client.container.services.ai.reply(interaction as never, { prompt: "数えて" });
		// 1回目で壊れたと判るので、以降の途中経過は撃たない(最終の1回だけ足される)。
		expect(attempts.edits).toBe(2);
		await client.destroy();
	});

	test("stream.enabled: false なら完成してから1回だけ送る", async () => {
		const client = createAiClient({ model: mockModel("できました"), stream: { enabled: false } });
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "やあ",
		});
		expect(result.edits).toBe(1);
		expect(bodyOf(edits[0])).toBe("できました");
		await client.destroy();
	});

	test("呼び出しごとに stream を上書きできる", async () => {
		const client = createAiClient({ model: mockModel("できました") });
		await client.load();
		const { interaction } = fakeInteraction(client);

		// 既定は stream: true だが、モデルは doStream を持たないので false を渡す。
		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "やあ",
			stream: false,
		});
		expect(result.error).toBeNull();
		expect(result.text).toBe("できました");
		await client.destroy();
	});
});

describe("応答の引き受け", () => {
	test("先に deferReply して、以降は編集で返す", async () => {
		const client = createAiClient({ model: mockModel("はい"), stream: { enabled: false } });
		await client.load();
		const { interaction, defers } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(defers.length).toBe(1);
		expect(defers[0]).toEqual({});
		expect(interaction.deferred).toBe(true);
		await client.destroy();
	});

	test("ephemeral を指定すると defer と追加送信に flags が付く", async () => {
		const client = createAiClient({
			model: mockModel("あ".repeat(2_500)),
			stream: { enabled: false },
			display: { embeds: false, ephemeral: true },
		});
		await client.load();
		const { interaction, defers, followUps } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(defers[0]).toEqual({ flags: MessageFlags.Ephemeral });
		expect(followUps[0]?.flags).toBe(MessageFlags.Ephemeral);
		await client.destroy();
	});

	test("既定は ephemeral ではない", async () => {
		const client = createAiClient({ model: mockModel("はい"), stream: { enabled: false } });
		await client.load();
		const { interaction, defers } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(defers[0]).toEqual({});
		await client.destroy();
	});
});

describe("見せ方", () => {
	test("既定は埋め込み / display.embeds: false でプレーンテキスト", async () => {
		const embedded = createAiClient({ model: mockModel("はい"), stream: { enabled: false } });
		const plain = createAiClient({
			model: mockModel("はい"),
			stream: { enabled: false },
			display: { embeds: false },
		});
		await embedded.load();
		await plain.load();

		const a = fakeInteraction(embedded);
		await embedded.container.services.ai.reply(a.interaction as never, { prompt: "やあ" });
		expect(a.edits[0]?.embeds?.[0]?.data.description).toBe("はい");
		expect(a.edits[0]?.content).toBeUndefined();

		const b = fakeInteraction(plain);
		await plain.container.services.ai.reply(b.interaction as never, { prompt: "やあ" });
		expect(b.edits[0]?.content).toBe("はい");
		expect(b.edits[0]?.embeds).toBeUndefined();
		await embedded.destroy();
		await plain.destroy();
	});

	test("呼び出しごとに embeds を上書きできる", async () => {
		const client = createAiClient({ model: mockModel("はい"), stream: { enabled: false } });
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, {
			prompt: "やあ",
			embeds: false,
		});
		expect(edits[0]?.content).toBe("はい");
		await client.destroy();
	});

	test("display.decorate が通る", async () => {
		const kinds: string[] = [];
		const decorate = (embed: EmbedBuilder, kind: string) => {
			kinds.push(kind);
			return embed.setTitle("装飾");
		};
		const client = createAiClient({
			model: mockModel("はい"),
			stream: { enabled: false },
			display: { decorate: decorate as never },
		});
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(edits[0]?.embeds?.[0]?.data.title).toBe("装飾");
		expect(kinds).toEqual(["info"]);
		await client.destroy();
	});

	test("kind を指定すると埋め込みの色が変わる", async () => {
		const client = createAiClient({ model: mockModel("はい"), stream: { enabled: false } });
		await client.load();
		const info = fakeInteraction(client);
		const success = fakeInteraction(client);

		await client.container.services.ai.reply(info.interaction as never, { prompt: "やあ" });
		await client.container.services.ai.reply(success.interaction as never, {
			prompt: "やあ",
			kind: "success",
		});
		expect(info.edits[0]?.embeds?.[0]?.data.color).not.toBe(
			success.edits[0]?.embeds?.[0]?.data.color,
		);
		await client.destroy();
	});

	test("answerBody を差し替えると本文の組み立てごと変わる", async () => {
		const client = createAiClient({
			model: mockToolCallingModel("ping", {}, "答え"),
			stream: { enabled: false },
			display: { embeds: false },
			texts: {
				answerBody: ({ answer, tools, usage }) =>
					[`【${answer}】`, tools.join(","), usage ?? "-"].join(" / "),
			},
		});
		client.register(PingTool);
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		// 使用ツールとトークン数の断片も渡っていることを、差し替えた本文で確かめる。
		expect(bodyOf(edits.at(-1))).toBe("【答え】 / `ping` / トークン: 入力 3 / 出力 3 / 合計 6");
		await client.destroy();
	});

	test("引用元が sourceLine と sourcesHeader で並ぶ", async () => {
		const client = createAiClient({
			model: mockSourceModel("答え", [
				{ url: "https://example.com/a", title: "記事A" },
				{ url: "https://example.com/b" },
			]),
			stream: { enabled: false },
			display: { embeds: false },
		});
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(bodyOf(edits.at(-1))).toBe(
			[
				"答え",
				"",
				"**引用元:**",
				"`1.` [記事A](https://example.com/a)",
				// 題名が無ければ URL がそのまま題名になる。
				"`2.` [https://example.com/b](https://example.com/b)",
			].join("\n"),
		);
		await client.destroy();
	});

	test("引用元の見出しと行は差し替えられる", async () => {
		const client = createAiClient({
			model: mockSourceModel("答え", [{ url: "https://example.com/a", title: "記事A" }]),
			stream: { enabled: false },
			display: { embeds: false },
			texts: {
				sourcesHeader: "出典",
				sourceLine: (position, title) => `${position}) ${title}`,
			},
		});
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(bodyOf(edits.at(-1))).toBe("答え\n\n出典\n1) 記事A");
		await client.destroy();
	});

	test("引用元が無ければ見出しも出ない", async () => {
		const client = createAiClient({
			model: mockSourceModel("答え", []),
			stream: { enabled: false },
			display: { embeds: false },
		});
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(bodyOf(edits.at(-1))).toBe("答え");
		await client.destroy();
	});

	test("同じツールを2回呼んでも使用ツールは1つに畳まれる", async () => {
		const client = createAiClient({
			model: mockRepeatToolModel("ping", "答え"),
			stream: { enabled: false },
			display: { embeds: false },
			texts: { answerBody: ({ tools }) => tools.join(",") },
		});
		client.register(PingTool);
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "やあ",
		});
		expect(result.toolNames).toEqual(["ping"]);
		expect(bodyOf(edits.at(-1))).toBe("`ping`");
		await client.destroy();
	});

	test("応答が空なら emptyResponse になる", async () => {
		const client = createAiClient({
			model: mockModel(""),
			stream: { enabled: false },
			display: { embeds: false },
		});
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(bodyOf(edits.at(-1))).toBe(defaultAiTexts.emptyResponse);
		await client.destroy();
	});
});

describe("メンションの解決", () => {
	/** モデルの出力に `@everyone` を混ぜたクライアント。 */
	async function mentioning(options: AiOptions = {}) {
		const client = createAiClient({
			model: mockModel("@everyone こんにちは"),
			stream: { enabled: false },
			display: { embeds: false, ...options.display },
			...options,
		});
		await client.load();
		return client;
	}

	test("既定はどのメンションも解決しない(安全側)", async () => {
		// LLM の出力をそのまま content へ流すので、既定で everyone を撃たせない。
		const client = await mentioning();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(edits.at(-1)?.content).toBe("@everyone こんにちは");
		expect(edits.at(-1)?.allowedMentions).toEqual({ parse: [] });
		await client.destroy();
	});

	test("display.allowedMentions で許可を広げられる", async () => {
		const client = await mentioning({ display: { allowedMentions: { parse: ["users"] } } });
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(edits.at(-1)?.allowedMentions).toEqual({ parse: ["users"] });
		await client.destroy();
	});

	test("null なら discord.js の既定に任せる(キーごと付けない)", async () => {
		const client = await mentioning({ display: { allowedMentions: null } });
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(edits.at(-1)).not.toHaveProperty("allowedMentions");
		await client.destroy();
	});

	test("埋め込み経路・途中経過・分割された2通目以降にも付く", async () => {
		const client = createAiClient({
			model: mockStreamModel(Array.from({ length: 30 }, () => "あ".repeat(100)), 1),
			stream: { intervalMs: 0 },
			display: { splitThreshold: 1_000 },
		});
		await client.load();
		const { interaction, edits, followUps } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "長文" });
		expect(followUps.length).toBe(2);
		for (const sent of [...edits, ...followUps]) {
			expect(sent.embeds).toBeDefined();
			expect(sent.allowedMentions).toEqual({ parse: [] });
		}
		await client.destroy();
	});
});

describe("display.payload フック", () => {
	test("埋め込み経路でもプレーンテキスト経路でも送信直前に通る", async () => {
		const seen: string[] = [];
		const make = (embeds: boolean) =>
			createAiClient({
				model: mockModel("はい"),
				stream: { enabled: false },
				display: {
					embeds,
					payload: (payload) => {
						seen.push("embeds" in payload && payload.embeds ? "embed" : "plain");
						return payload;
					},
				},
			});

		for (const embeds of [true, false]) {
			const client = make(embeds);
			await client.load();
			const { interaction } = fakeInteraction(client);
			await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
			await client.destroy();
		}
		// どちらの経路も通っている(仮表示は送らないので最終の1通ずつ)。
		expect(seen).toEqual(["embed", "plain"]);
	});

	test("index / total / streaming / kind が渡る", async () => {
		const contexts: AiPayloadContext[] = [];
		const client = createAiClient({
			model: mockStreamModel(Array.from({ length: 20 }, () => "あ".repeat(100)), 1),
			stream: { intervalMs: 0 },
			display: {
				embeds: false,
				splitThreshold: 1_000,
				payload: (payload, context) => {
					contexts.push(context);
					return payload;
				},
			},
		});
		await client.load();
		const { interaction } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, {
			prompt: "長文",
			kind: "success",
		});

		// 途中経過は index=1 / total=1 / streaming=true。
		const progress = contexts.filter((context) => context.streaming);
		expect(progress.length).toBeGreaterThan(0);
		for (const context of progress) {
			expect(context).toEqual({ kind: "success", index: 1, total: 1, streaming: true });
		}
		// 最終出力は2000文字 → 1000文字ずつ2通、index は1始まり。
		const final = contexts.filter((context) => !context.streaming);
		expect(final).toEqual([
			{ kind: "success", index: 1, total: 2, streaming: false },
			{ kind: "success", index: 2, total: 2, streaming: false },
		]);
		await client.destroy();
	});

	test("失敗したときは kind: error で渡る", async () => {
		const kinds: string[] = [];
		const client = createAiClient({
			model: mockFailingModel("壊れた"),
			stream: { enabled: false },
			display: {
				embeds: false,
				payload: (payload, context) => {
					kinds.push(context.kind);
					return payload;
				},
			},
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const { interaction } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(kinds).toEqual(["error"]);
		await client.destroy();
	});

	test("decorate より後に走る(payload が最後の言い分)", async () => {
		const order: string[] = [];
		const client = createAiClient({
			model: mockModel("はい"),
			stream: { enabled: false },
			display: {
				decorate: (embed) => {
					order.push("decorate");
					return embed.setTitle("かざり");
				},
				payload: (payload) => {
					order.push("payload");
					return payload;
				},
			},
		});
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(order).toEqual(["decorate", "payload"]);
		expect(edits.at(-1)?.embeds?.[0]?.data.title).toBe("かざり");
		await client.destroy();
	});

	test("返したペイロードがそのまま送られる", async () => {
		const client = createAiClient({
			model: mockModel("はい"),
			stream: { enabled: false },
			display: {
				embeds: false,
				payload: () => ({ content: "差し替えました", allowedMentions: { parse: [] } }),
			},
		});
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(edits.at(-1)?.content).toBe("差し替えました");
		await client.destroy();
	});

	test("指定しなければ何も変わらない", async () => {
		const client = createAiClient({
			model: mockModel("はい"),
			stream: { enabled: false },
			display: { embeds: false },
		});
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(edits.at(-1)).toEqual({ content: "はい", allowedMentions: { parse: [] } });
		await client.destroy();
	});
});

describe("分割", () => {
	test("2000文字超はプレーンテキストで分割される", async () => {
		const client = createAiClient({
			model: mockModel("あ".repeat(2_500)),
			stream: { enabled: false },
			display: { embeds: false },
		});
		await client.load();
		const { interaction, edits, followUps } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "長く",
		});
		expect(result.followUps).toBe(1);
		expect(bodyOf(edits.at(-1)).length).toBe(2_000);
		expect(bodyOf(followUps[0]).length).toBe(500);
		await client.destroy();
	});

	test("埋め込みなら 4096 まで1通で収まる", async () => {
		const client = createAiClient({
			model: mockModel("あ".repeat(2_500)),
			stream: { enabled: false },
		});
		await client.load();
		const { interaction, followUps } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "長く",
		});
		expect(result.followUps).toBe(0);
		expect(followUps.length).toBe(0);
		await client.destroy();
	});

	test("splitThreshold を差し替えると分割位置が変わる", async () => {
		const client = createAiClient({
			model: mockModel("あ".repeat(250)),
			stream: { enabled: false },
			display: { embeds: false, splitThreshold: 100 },
		});
		await client.load();
		const { interaction, followUps } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "長く",
		});
		expect(result.followUps).toBe(2);
		expect(bodyOf(followUps[1]).length).toBe(50);
		await client.destroy();
	});

	test("呼び出しごとの embeds 上書きにも分割位置が追従する", async () => {
		// 明示していなければ、その呼び出しで実際に使う表示方法から決まる。
		const client = createAiClient({
			model: mockModel("あ".repeat(3_000)),
			stream: { enabled: false },
		});
		await client.load();
		const { interaction, edits, followUps } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, {
			prompt: "長く",
			embeds: false,
		});
		// プレーンテキストの上限は 2000。ここを超えると実 Discord では落ちる。
		expect(edits.at(-1)?.content?.length).toBe(2_000);
		expect(followUps.length).toBe(1);
		expect(bodyOf(followUps[0]).length).toBe(1_000);
		await client.destroy();
	});

	test("splitThreshold を明示していれば embeds 上書きでも変わらない", async () => {
		// 明示した 1500 が使われる(embeds: false の auto なら 2000 になるはず)。
		const client = createAiClient({
			model: mockModel("あ".repeat(3_000)),
			stream: { enabled: false },
			display: { splitThreshold: 1_500 },
		});
		await client.load();
		const { interaction, edits, followUps } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, {
			prompt: "長く",
			embeds: false,
		});
		expect(edits.at(-1)?.content?.length).toBe(1_500);
		expect(followUps.length).toBe(1);
		expect(bodyOf(followUps[0]).length).toBe(1_500);
		await client.destroy();
	});

	test("上限を超える明示値でも回答は失われない(埋め込みは 4096 に丸める)", async () => {
		// splitThreshold: 8000 のままだと 4096 超の説明文で discord.js が
		// 同期に throw し、最終送信ごと回答が失われる(旧動作)。
		const client = createAiClient({
			model: mockModel("あ".repeat(5_000)),
			stream: { enabled: false },
			display: { splitThreshold: 8_000 },
		});
		await client.load();
		const { interaction, edits, followUps } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "長く",
		});
		expect(result.error).toBeNull();
		// 回答は捨てられず、各通が埋め込みの上限 4096 に収まる形で分割される。
		const parts = [bodyOf(edits.at(-1)), ...followUps.map(bodyOf)];
		for (const part of parts) expect(part.length).toBeLessThanOrEqual(4_096);
		expect(parts.join("").length).toBe(5_000);
		expect(followUps.length).toBe(1);
		await client.destroy();
	});

	test("上限を超える明示値でも回答は失われない(プレーンは 2000 に丸める)", async () => {
		const client = createAiClient({
			model: mockModel("あ".repeat(3_000)),
			stream: { enabled: false },
			display: { embeds: false, splitThreshold: 8_000 },
		});
		await client.load();
		const { interaction, edits, followUps } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "長く",
		});
		expect(result.error).toBeNull();
		// 実 Discord は 2000 超の content を拒否するので、超えない形で届ける。
		const parts = [edits.at(-1)?.content ?? "", ...followUps.map(bodyOf)];
		for (const part of parts) expect(part.length).toBeLessThanOrEqual(2_000);
		expect(parts.join("").length).toBe(3_000);
		expect(followUps.length).toBe(1);
		await client.destroy();
	});
});

describe("ストリーミング中の上限", () => {
	/** 100文字 × 60 = 6000文字(埋め込みの上限 4096 を超える)。 */
	const longChunks = Array.from({ length: 60 }, () => "あ".repeat(100));

	test("既定の経路で上限を超えても回答は捨てられない", async () => {
		const client = createAiClient({
			model: mockStreamModel(longChunks, 1),
			stream: { intervalMs: 0 },
		});
		await client.load();
		const errors: AiErrorInfo[] = [];
		client.on(AiEvents.Error, (_error, info) => errors.push(info));
		const { interaction, edits, followUps } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "長文",
		});

		expect(result.error).toBeNull();
		expect(result.text).toHaveLength(6_000);
		// 最終出力は分割されて全文が届く。
		expect(followUps.length).toBe(1);
		expect(bodyOf(edits.at(-1)).length + bodyOf(followUps[0]).length).toBe(6_000);
		// 途中経過の編集は一度も失敗していない。
		expect(errors).toEqual([]);
		await client.destroy();
	});

	test("途中経過は切り詰め・最終出力は分割", async () => {
		const client = createAiClient({
			model: mockStreamModel(longChunks, 1),
			stream: { intervalMs: 0 },
			display: { splitThreshold: 200 },
			texts: { truncated: "…続く" },
		});
		await client.load();
		const { interaction, edits, followUps } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "長文" });

		// 最後の1通は最終出力。それ以外はすべて途中経過。
		const progress = edits.slice(0, -1);
		expect(progress.length).toBeGreaterThan(1);
		for (const sent of progress) expect(bodyOf(sent).length).toBeLessThanOrEqual(200);
		expect(progress.some((sent) => bodyOf(sent).endsWith("…続く"))).toBe(true);
		// 最終出力は切り詰めずに分割する(6000 / 200 = 30通)。
		expect(followUps.length).toBe(29);
		await client.destroy();
	});

	test("途中経過の組み立てが同期に失敗しても、蓄積した本文は失われない", async () => {
		// 送信直前のフックが同期 throw する状況(埋め込みの上限超過も同じ形)。
		const client = createAiClient({
			model: mockStreamModel(["あ", "い", "う", "え", "お"], 2),
			stream: { intervalMs: 0 },
			display: {
				embeds: false,
				payload: (payload, context) => {
					if (context.streaming) throw new Error("組み立て失敗");
					return payload;
				},
			},
		});
		await client.load();
		const errors: AiErrorInfo[] = [];
		client.on(AiEvents.Error, (_error, info) => errors.push(info));
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "書いて",
		});

		expect(result.error).toBeNull();
		expect(result.text).toBe("あいうえお");
		expect(bodyOf(edits.at(-1))).toBe("あいうえお");
		// 失敗は握りつぶさず aiError へ落とす(生成は続ける)。
		expect(errors.map((info) => info.phase)).toContain("display");
		await client.destroy();
	});
});

describe("上限", () => {
	test("maxResponseLength を超えると切り詰められる", async () => {
		const client = createAiClient({
			model: mockModel("あ".repeat(50)),
			stream: { enabled: false },
			display: { embeds: false },
			limits: { maxResponseLength: 10 },
		});
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "長く",
		});
		expect(result.text.length).toBe(10);
		expect(bodyOf(edits.at(-1)).endsWith(defaultAiTexts.truncated)).toBe(true);
		await client.destroy();
	});

	test("既定では切り詰めない", async () => {
		const client = createAiClient({
			model: mockModel("あ".repeat(50)),
			stream: { enabled: false },
			display: { embeds: false },
		});
		await client.load();
		const { interaction } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "長く",
		});
		expect(result.text.length).toBe(50);
		await client.destroy();
	});

	test("入力が長すぎると表示を引き受ける前に落ちる", async () => {
		const client = createAiClient({
			model: mockModel("はい"),
			limits: { maxPromptLength: 5 },
		});
		await client.load();
		const { interaction, defers } = fakeInteraction(client);

		await expect(
			client.container.services.ai.reply(interaction as never, { prompt: "あいうえおか" }),
		).rejects.toBeInstanceOf(PromptTooLongError);
		// defer していない = フレームワークの既定処理がそのまま返信できる。
		expect(defers.length).toBe(0);
		expect(interaction.deferred).toBe(false);
		await client.destroy();
	});

	test("既定の上限(4000)なら通る", async () => {
		const client = createAiClient({ model: mockModel("はい"), stream: { enabled: false } });
		await client.load();
		const { interaction } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "あ".repeat(4_000),
		});
		expect(result.error).toBeNull();
		await client.destroy();
	});

	test("cooldown を設定すると2回目が弾かれる", async () => {
		const client = createAiClient({
			model: mockModel("はい"),
			stream: { enabled: false },
			limits: { cooldown: "1m" },
		});
		await client.load();

		const first = fakeInteraction(client);
		await client.container.services.ai.reply(first.interaction as never, { prompt: "やあ" });

		const second = fakeInteraction(client);
		await expect(
			client.container.services.ai.reply(second.interaction as never, { prompt: "やあ" }),
		).rejects.toBeInstanceOf(CooldownError);
		// 別のユーザーは弾かれない。
		const other = fakeInteraction(client, { userId: "u2" });
		const result = await client.container.services.ai.reply(other.interaction as never, {
			prompt: "やあ",
		});
		expect(result.error).toBeNull();
		await client.destroy();
	});

	test("既定ではクールダウンなし", async () => {
		const client = createAiClient({ model: mockModel("はい"), stream: { enabled: false } });
		await client.load();

		for (const _ of [1, 2, 3]) {
			const { interaction } = fakeInteraction(client);
			const result = await client.container.services.ai.reply(interaction as never, {
				prompt: "やあ",
			});
			expect(result.error).toBeNull();
		}
		await client.destroy();
	});

	test("生成が失敗した呼び出しはクールダウンを消費しない", async () => {
		// プロバイダー障害のあいだ、失敗しただけのユーザーを締め出さない。
		const client = createAiClient({
			model: mockFailingModel("落ちた"),
			stream: { enabled: false },
			limits: { cooldown: "1m" },
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const service = client.container.services.ai;

		const first = fakeInteraction(client);
		const failed = await service.reply(first.interaction as never, { prompt: "やあ" });
		expect(failed.error).toBeInstanceOf(Error);
		expect(failed.text).toBe("");

		// 払い戻されているので、同じユーザーの2回目は CooldownError にならず
		// 生成まで進む(生成そのものはまた失敗する)。
		const second = fakeInteraction(client);
		const retried = await service.reply(second.interaction as never, { prompt: "やあ" });
		expect(retried.error).toBeInstanceOf(Error);
		expect((retried.error as Error).message).toBe("落ちた");
		await client.destroy();
	});

	test("モデル未設定の throw でもクールダウンを消費しない", async () => {
		// 表示を引き受ける前の失敗(モデル解決)は throw されるが、
		// その場合もクールダウンは払い戻される。
		const client = createAiClient({ limits: { cooldown: "1m" } });
		await client.load();
		const service = client.container.services.ai;

		const first = fakeInteraction(client);
		await expect(
			service.reply(first.interaction as never, { prompt: "やあ" }),
		).rejects.toBeInstanceOf(ModelNotConfiguredError);

		// 払い戻されていなければ、ここは CooldownError になってしまう。
		const second = fakeInteraction(client);
		await expect(
			service.reply(second.interaction as never, { prompt: "やあ" }),
		).rejects.toBeInstanceOf(ModelNotConfiguredError);
		await client.destroy();
	});

	test("途中まで表示できた失敗はクールダウンを消費する", async () => {
		// 断片を見せたあとでストリームが失敗 = ユーザーは途中までの回答を
		// 受け取っている。利用として数えるので払い戻さない。
		const client = createAiClient({
			model: mockStreamErrorModel(new Error("途中で切れた"), ["こたえの", "とちゅう"]),
			stream: { intervalMs: 0 },
			limits: { cooldown: "1m" },
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const service = client.container.services.ai;

		const first = fakeInteraction(client);
		const result = await service.reply(first.interaction as never, { prompt: "やあ" });
		expect(result.error).toBeInstanceOf(Error);
		expect(result.text).toBe("こたえのとちゅう");

		const second = fakeInteraction(client);
		await expect(
			service.reply(second.interaction as never, { prompt: "やあ" }),
		).rejects.toBeInstanceOf(CooldownError);
		await client.destroy();
	});

	test("本文が出たあとの error パートでもクールダウンを消費する", async () => {
		// 本文が出ていれば結果の Promise は解決する(失敗は onError にだけ来る)。
		// 回答は届いているので、この場合も払い戻さない。
		const client = createAiClient({
			model: mockPartialErrorModel(["こたえ"], new Error("あとから失敗")),
			stream: { intervalMs: 0 },
			limits: { cooldown: "1m" },
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const service = client.container.services.ai;

		const first = fakeInteraction(client);
		const result = await service.reply(first.interaction as never, { prompt: "やあ" });
		expect(result.text).toBe("こたえ");

		const second = fakeInteraction(client);
		await expect(
			service.reply(second.interaction as never, { prompt: "やあ" }),
		).rejects.toBeInstanceOf(CooldownError);
		await client.destroy();
	});

	test("払い戻しは、別の呼び出しが刻み直したクールダウンを消さない", async () => {
		// A が失敗を保留しているあいだに期限が切れ、B が成功して刻み直す。
		// 遅れて届いた A の払い戻しが B の期限を消してはいけない。
		const manual = mockManualFailingModel();
		const client = createAiClient({
			model: mockModel("はい"),
			stream: { enabled: false },
			limits: { cooldown: 200 },
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const service = client.container.services.ai;

		const first = fakeInteraction(client);
		const pending = service.reply(first.interaction as never, {
			prompt: "やあ",
			model: manual.model,
		});
		await Bun.sleep(220);

		const second = fakeInteraction(client);
		const succeeded = await service.reply(second.interaction as never, { prompt: "やあ" });
		expect(succeeded.error).toBeNull();

		manual.fail(new Error("遅れて失敗"));
		const failed = await pending;
		expect(failed.error).toBeInstanceOf(Error);

		// B の期限はまだ生きている(A の払い戻しで消えていない)。
		const third = fakeInteraction(client);
		await expect(
			service.reply(third.interaction as never, { prompt: "やあ" }),
		).rejects.toBeInstanceOf(CooldownError);
		await client.destroy();
	});
});

describe("失敗", () => {
	test("生成が失敗したら応答へ表示し、throw しない", async () => {
		const client = createAiClient({
			model: mockFailingModel("壊れた"),
			stream: { enabled: false },
			display: { embeds: false },
		});
		await client.load();
		const infos: AiErrorInfo[] = [];
		client.on(AiEvents.Error, (_error, info) => infos.push(info));
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "やあ",
		});
		expect(result.error).toBeInstanceOf(Error);
		expect(bodyOf(edits.at(-1))).toContain("壊れた");
		expect(bodyOf(edits.at(-1))).toContain("応答の生成に失敗しました");
		expect(infos.map((info) => info.phase)).toEqual(["generate"]);
		await client.destroy();
	});

	test("タイムアウトは差し替え可能な文言になる", async () => {
		const client = createAiClient({
			model: mockTimingOutModel(),
			stream: { enabled: false },
			display: { embeds: false },
			timeout: 20,
			texts: { timedOut: (ms) => `${ms}ms で諦めました` },
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "やあ",
		});
		expect(result.error).toBeInstanceOf(AiTimeoutError);
		expect(bodyOf(edits.at(-1))).toContain("20ms で諦めました");
		await client.destroy();
	});

	test("包まれたタイムアウト(cause 側)も見つける", async () => {
		const client = createAiClient({
			model: mockStreamErrorModel(
				new Error("リクエストが失敗しました", {
					cause: new DOMException("Total timeout of 20ms exceeded", "TimeoutError"),
				}),
			),
			display: { embeds: false },
			timeout: 20,
			texts: { timedOut: () => "時間切れ" },
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "やあ",
		});
		expect(result.error).toBeInstanceOf(AiTimeoutError);
		expect(bodyOf(edits.at(-1))).toContain("時間切れ");
		await client.destroy();
	});

	test("timeout: false ならタイムアウトのエラーには包み直さない", async () => {
		const client = createAiClient({
			model: mockTimingOutModel(),
			stream: { enabled: false },
			timeout: false,
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const { interaction } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "やあ",
		});
		expect(result.error).not.toBeInstanceOf(AiTimeoutError);
		await client.destroy();
	});

	test("呼び出し側が中断した場合はタイムアウト扱いにしない", async () => {
		const client = createAiClient({ model: mockTimingOutModel(), timeout: 20 });
		await client.load();
		const controller = new AbortController();
		controller.abort();

		const error = await client.container.services.ai
			.ask("やあ", { abortSignal: controller.signal })
			.catch((cause: unknown) => cause);
		expect(error).not.toBeInstanceOf(AiTimeoutError);
		await client.destroy();
	});

	test("ストリーミング中のタイムアウトも同じ文言になる", async () => {
		const client = createAiClient({
			model: mockStreamErrorModel(
				new DOMException("Total timeout of 20ms exceeded", "TimeoutError"),
			),
			display: { embeds: false },
			timeout: 20,
			texts: { timedOut: () => "時間切れ" },
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "やあ",
		});
		expect(result.error).toBeInstanceOf(AiTimeoutError);
		expect(bodyOf(edits.at(-1))).toContain("時間切れ");
		await client.destroy();
	});

	test("失敗の文言は差し替えられる", async () => {
		const client = createAiClient({
			model: mockFailingModel("壊れた"),
			stream: { enabled: false },
			display: { embeds: false },
			texts: { generationFailed: (message) => `だめでした(${message})` },
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(bodyOf(edits.at(-1))).toBe("だめでした(壊れた)");
		await client.destroy();
	});

	test("失敗時も answerBody を通る(途中までの本文を残せる)", async () => {
		const client = createAiClient({
			model: mockStreamErrorModel(new Error("ちぎれた"), ["途中まで", "書いた"]),
			stream: { intervalMs: 0 },
			display: { embeds: false },
			texts: {
				generationFailed: (message) => `だめ:${message}`,
				answerBody: ({ answer, failure }) =>
					failure === null ? answer : `${answer}\n---\n${failure}`,
			},
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "書いて",
		});
		expect(bodyOf(edits.at(-1))).toBe("途中まで書いた\n---\nだめ:ちぎれた");
		expect(result.text).toBe("途中まで書いた");
		await client.destroy();
	});

	test("差し替えなければ失敗時の表示はエラー文言だけ(既定は変わらない)", async () => {
		const client = createAiClient({
			model: mockStreamErrorModel(new Error("ちぎれた"), ["途中まで", "書いた"]),
			stream: { intervalMs: 0 },
			display: { embeds: false },
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "書いて" });
		expect(bodyOf(edits.at(-1))).toBe(defaultAiTexts.generationFailed("ちぎれた"));
		await client.destroy();
	});

	test("成功時は failure が null で渡る", async () => {
		const failures: (string | null)[] = [];
		const client = createAiClient({
			model: mockModel("はい"),
			stream: { enabled: false },
			display: { embeds: false },
			texts: {
				answerBody: ({ answer, failure }) => {
					failures.push(failure);
					return answer;
				},
			},
		});
		await client.load();
		const { interaction } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "やあ" });
		expect(failures).toEqual([null]);
		await client.destroy();
	});

	test("失敗した表示は error の色になる", async () => {
		const client = createAiClient({
			model: mockFailingModel("壊れた"),
			stream: { enabled: false },
		});
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const ok = fakeInteraction(client);
		const ng = fakeInteraction(client);

		const good = createAiClient({ model: mockModel("はい"), stream: { enabled: false } });
		await good.load();
		await good.container.services.ai.reply(ok.interaction as never, { prompt: "やあ" });
		await client.container.services.ai.reply(ng.interaction as never, { prompt: "やあ" });

		expect(ng.edits.at(-1)?.embeds?.[0]?.data.color).not.toBe(
			ok.edits.at(-1)?.embeds?.[0]?.data.color,
		);
		await client.destroy();
		await good.destroy();
	});
});

describe("イベントと履歴", () => {
	test("aiRequest と aiResponse が発火する", async () => {
		const client = createAiClient({
			model: mockToolCallingModel("ping", {}, "答え"),
			stream: { enabled: false },
		});
		client.register(PingTool);
		await client.load();
		const { interaction } = fakeInteraction(client);

		const requests: unknown[] = [];
		const responses: unknown[] = [];
		client.on(AiEvents.Request, (request) => requests.push(request));
		client.on(AiEvents.Response, (response) => responses.push(response));

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "やあ",
		});
		expect(requests).toEqual([
			{
				prompt: "やあ",
				channelId: "c1",
				userId: "u1",
				guildId: "g1",
				streaming: false,
				toolNames: ["ping"],
			},
		]);
		expect(responses).toEqual([
			{
				text: "答え",
				usage: result.usage,
				finishReason: "stop",
				toolNames: ["ping"],
			},
		]);
		expect(result.toolNames).toEqual(["ping"]);
		await client.destroy();
	});

	test("history を渡すと reply が履歴を書く", async () => {
		const client = createAiClient({ model: mockModel("はい"), stream: { enabled: false } });
		await client.load();
		const { interaction } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, {
			prompt: "覚えて",
			history: "c1",
		});
		expect((await client.container.services.ai.history("c1")).map((m) => m.content)).toEqual([
			"覚えて",
			"はい",
		]);
		await client.destroy();
	});

	test("history を渡さなければ履歴は残らない", async () => {
		const client = createAiClient({ model: mockModel("はい"), stream: { enabled: false } });
		await client.load();
		const { interaction } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, { prompt: "覚えないで" });
		expect(await client.container.services.ai.history("c1")).toEqual([]);
		await client.destroy();
	});
});
