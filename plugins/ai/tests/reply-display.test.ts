/**
 * `reply()` の呼び出し単位の表示カスタマイズ(`display` / `texts` オプション)の検証。
 *
 * **ネットワークにも API キーにも触りません** — 偽のインタラクションへ
 * 送られたペイロードを覗いて、上書きの効き方と優先順位を確かめます。
 */
import { describe, expect, test } from "bun:test";
import { MessageFlags } from "@cc-discord-framework/core";
import { createEmbeds } from "@cc-discord-framework/utils";
import { AiEvents, AiTimeoutError, type AiMessagePayload } from "../src/index.js";
import {
	bodyOf,
	createAiClient,
	fakeInteraction,
	mockModel,
	mockTimingOutModel,
} from "./helpers.js";

describe("reply() の呼び出し単位の表示上書き", () => {
	test("display.decorate はその呼び出しだけ設定側より優先される", async () => {
		const client = createAiClient({
			model: mockModel("こたえ"),
			display: { decorate: (embed) => embed.setTitle("設定") },
		});
		await client.load();

		const first = fakeInteraction(client);
		await client.container.services.ai.reply(first.interaction as never, {
			prompt: "質問",
			stream: false,
			display: { decorate: (embed) => embed.setTitle("装飾") },
		});
		expect(first.edits.at(-1)?.embeds?.[0]?.data.title).toBe("装飾");

		// 上書きしない呼び出しは設定どおりのまま。
		const second = fakeInteraction(client);
		await client.container.services.ai.reply(second.interaction as never, {
			prompt: "質問",
			stream: false,
		});
		expect(second.edits.at(-1)?.embeds?.[0]?.data.title).toBe("設定");
		await client.destroy();
	});

	test("display.payload は設定側のフックを置き換える", async () => {
		const calls: string[] = [];
		const client = createAiClient({
			model: mockModel("こたえ"),
			display: {
				payload: (payload) => {
					calls.push("config");
					return payload;
				},
			},
		});
		await client.load();
		const { interaction } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, {
			prompt: "質問",
			stream: false,
			display: {
				payload: (payload) => {
					calls.push("call");
					return payload;
				},
			},
		});

		// 呼び出し単位のフックだけが通る(マージではなく置き換え)。
		expect(calls.length).toBeGreaterThan(0);
		expect(new Set(calls)).toEqual(new Set(["call"]));
		await client.destroy();
	});

	test("texts.answerBody をその呼び出しだけ差し替えられる", async () => {
		const client = createAiClient({ model: mockModel("こたえ") });
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, {
			prompt: "質問",
			stream: false,
			texts: { answerBody: ({ answer }) => `回答: ${answer}` },
		});
		expect(bodyOf(edits.at(-1))).toBe("回答: こたえ");
		await client.destroy();
	});

	test("フラットな embeds 指定は display.embeds より優先する", async () => {
		const client = createAiClient({ model: mockModel("こたえ") });
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, {
			prompt: "質問",
			stream: false,
			embeds: false,
			display: { embeds: true },
		});
		const sent = edits.at(-1);
		expect(sent?.content).toBe("こたえ");
		expect(sent?.embeds).toBeUndefined();
		await client.destroy();
	});

	test("display.allowedMentions の上書きが送信ペイロードに載る", async () => {
		const client = createAiClient({ model: mockModel("<@42> さんへ") });
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, {
			prompt: "質問",
			stream: false,
			display: { allowedMentions: { users: ["42"] } },
		});
		expect(edits.at(-1)?.allowedMentions).toEqual({ users: ["42"] });
		await client.destroy();
	});

	test("display.allowedMentions: null の上書きで discord.js の既定に任せる", async () => {
		const client = createAiClient({ model: mockModel("<@42> さんへ") });
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, {
			prompt: "質問",
			stream: false,
			display: { allowedMentions: null },
		});
		// 既定(設定)は { parse: [] } だが、この呼び出しだけキー自体を載せない。
		expect(edits.at(-1)?.allowedMentions).toBeUndefined();
		await client.destroy();
	});

	test("display.splitThreshold の上書きで分割位置が変わる", async () => {
		const client = createAiClient({ model: mockModel("あ".repeat(30)) });
		await client.load();
		const { interaction, edits, followUps } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, {
			prompt: "質問",
			stream: false,
			display: { splitThreshold: 20 },
		});
		// 30文字の回答が 20 文字で分割され、2通目が followUp で届く。
		expect(followUps.length).toBeGreaterThan(0);
		expect(bodyOf(edits.at(-1)).length).toBeLessThanOrEqual(20);
		await client.destroy();
	});

	test("texts.timedOut の上書きがタイムアウト時の表示に効く", async () => {
		const client = createAiClient({ model: mockTimingOutModel() });
		await client.load();
		client.on(AiEvents.Error, () => undefined);
		const { interaction, edits } = fakeInteraction(client);

		const result = await client.container.services.ai.reply(interaction as never, {
			prompt: "質問",
			stream: false,
			timeout: 20,
			texts: {
				timedOut: (ms) => `TIMED_OUT:${ms}`,
				generationFailed: (message) => `FAILED:${message}`,
			},
		});
		expect(result.error).toBeInstanceOf(AiTimeoutError);
		expect(bodyOf(edits.at(-1))).toBe("FAILED:TIMED_OUT:20");
		await client.destroy();
	});

	test("display.ephemeral の上書きで defer が本人だけに見える形になる", async () => {
		const client = createAiClient({ model: mockModel("こたえ") });
		await client.load();
		const { interaction, defers } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, {
			prompt: "質問",
			stream: false,
			display: { ephemeral: true },
		});
		expect(defers[0]).toEqual({ flags: MessageFlags.Ephemeral } as never);
		await client.destroy();
	});

	test('kind: "warning" はテーマの warning 色になる', async () => {
		const client = createAiClient({ model: mockModel("注意して") });
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, {
			prompt: "質問",
			stream: false,
			kind: "warning",
		});
		expect(edits.at(-1)?.embeds?.[0]?.data.color).toBe(createEmbeds().colors.warning);
		await client.destroy();
	});

	test("display.payload で components を足せる(型にも載っている)", async () => {
		const client = createAiClient({ model: mockModel("こたえ") });
		await client.load();
		const { interaction, edits } = fakeInteraction(client);

		await client.container.services.ai.reply(interaction as never, {
			prompt: "質問",
			stream: false,
			display: {
				payload: (payload): AiMessagePayload => ({
					...payload,
					components: [{ type: 1, components: [] }],
				}),
			},
		});
		const sent = edits.at(-1) as { components?: unknown[] } | undefined;
		expect(sent?.components).toEqual([{ type: 1, components: [] }]);
		await client.destroy();
	});
});
