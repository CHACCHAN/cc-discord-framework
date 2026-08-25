import { describe, expect, test } from "bun:test";
import { EMBED_DESCRIPTION_LIMIT, MESSAGE_LIMIT } from "@cc-discord-framework/utils";
import type { EmbedBuilder } from "@cc-discord-framework/core";
import {
	aiSplitThreshold,
	defaultAiConfig,
	defaultAiTexts,
	resolveAiConfig,
	resolveAiTexts,
	MapMemoryStore,
	type AiMessagePayload,
} from "../src/index.js";
import { createAiClient } from "./helpers.js";

describe("既定値", () => {
	test("モデルは決め打ちしていない(勝手に課金される先を既定にしない)", () => {
		expect(defaultAiConfig.model).toBeNull();
		expect(defaultAiConfig.registry).toBeNull();
		expect(defaultAiConfig.providers).toEqual({});
	});

	test("生成の既定値", () => {
		expect(defaultAiConfig.instructions).toBeNull();
		expect(defaultAiConfig.temperature).toBeNull();
		expect(defaultAiConfig.maxOutputTokens).toBeNull();
		expect(defaultAiConfig.maxSteps).toBe(5);
		expect(defaultAiConfig.timeout).toBe(120_000);
	});

	test("ツール・履歴・ストリーミング・上限・表示の既定値", () => {
		expect(defaultAiConfig.tools).toEqual({ enabled: true, timeout: 30_000 });
		expect(defaultAiConfig.memory).toEqual({
			enabled: true,
			maxMessages: 20,
			ttl: 3_600_000,
			store: undefined,
		});
		expect(defaultAiConfig.stream).toEqual({ enabled: true, intervalMs: 1_200, cursor: "▌" });
		expect(defaultAiConfig.limits).toEqual({
			maxPromptLength: 4_000,
			maxResponseLength: false,
			cooldown: false,
		});
		expect(defaultAiConfig.display.embeds).toBe(true);
		expect(defaultAiConfig.display.ephemeral).toBe(false);
		expect(defaultAiConfig.display.decorate).toBeUndefined();
	});

	test("splitThreshold の既定は auto(呼び出しごとの表示方法で決まる)", () => {
		expect(resolveAiConfig().display.splitThreshold).toBe("auto");
		expect(resolveAiConfig({ display: { embeds: false } }).display.splitThreshold).toBe("auto");

		// auto の解決結果は、その呼び出しで実際に使う表示方法から決まる。
		const config = resolveAiConfig();
		expect(aiSplitThreshold(config.display, true)).toBe(EMBED_DESCRIPTION_LIMIT);
		expect(aiSplitThreshold(config.display, false)).toBe(MESSAGE_LIMIT);
	});

	test("メンションは既定でひとつも解決しない(安全側)", () => {
		expect(defaultAiConfig.display.allowedMentions).toEqual({ parse: [] });
		expect(defaultAiConfig.display.payload).toBeUndefined();
	});
});

describe("aiSplitThreshold", () => {
	test("明示していなければ、渡された表示方法から決まる", () => {
		const config = resolveAiConfig();
		expect(aiSplitThreshold(config.display, true)).toBe(EMBED_DESCRIPTION_LIMIT);
		expect(aiSplitThreshold(config.display, false)).toBe(MESSAGE_LIMIT);
	});

	test("設定側で embeds を切っていても、渡された表示方法が優先される", () => {
		const config = resolveAiConfig({ display: { embeds: false } });
		expect(aiSplitThreshold(config.display, true)).toBe(EMBED_DESCRIPTION_LIMIT);
		expect(aiSplitThreshold(config.display, false)).toBe(MESSAGE_LIMIT);
	});

	test("明示していれば表示方法によらずその値", () => {
		const config = resolveAiConfig({ display: { splitThreshold: 900 } });
		expect(config.display.splitThreshold).toBe(900);
		expect(aiSplitThreshold(config.display, true)).toBe(900);
		expect(aiSplitThreshold(config.display, false)).toBe(900);
	});

	test("上限を超える明示値は表示方法の上限に丸められる", () => {
		// 超えた指定は discord.js が送信時に必ず拒否する(= 回答が丸ごと
		// 失われる)ので、様式の選択ではなく上限へ丸める。
		const config = resolveAiConfig({ display: { splitThreshold: 8_000 } });
		expect(aiSplitThreshold(config.display, true)).toBe(EMBED_DESCRIPTION_LIMIT);
		expect(aiSplitThreshold(config.display, false)).toBe(MESSAGE_LIMIT);

		// プレーンテキストの上限だけを超える値は、埋め込みでは丸められない。
		const middle = resolveAiConfig({ display: { splitThreshold: 3_000 } });
		expect(aiSplitThreshold(middle.display, true)).toBe(3_000);
		expect(aiSplitThreshold(middle.display, false)).toBe(MESSAGE_LIMIT);
	});
});

describe("差し替え", () => {
	test("生成の設定を差し替えられる", () => {
		const config = resolveAiConfig({
			instructions: "あなたは猫",
			temperature: 0.2,
			maxOutputTokens: 512,
			maxSteps: 1,
			timeout: "30s",
		});
		expect(config.instructions).toBe("あなたは猫");
		expect(config.temperature).toBe(0.2);
		expect(config.maxOutputTokens).toBe(512);
		expect(config.maxSteps).toBe(1);
		expect(config.timeout).toBe(30_000);
	});

	test("timeout は false で無制限にできる", () => {
		expect(resolveAiConfig({ timeout: false }).timeout).toBe(false);
		expect(resolveAiConfig({ tools: { timeout: false } }).tools.timeout).toBe(false);
		expect(resolveAiConfig({ memory: { ttl: false } }).memory.ttl).toBe(false);
	});

	test("期間はミリ秒でも期間表記でも書ける", () => {
		expect(resolveAiConfig({ timeout: 5_000 }).timeout).toBe(5_000);
		expect(resolveAiConfig({ timeout: "1h30m" }).timeout).toBe(5_400_000);
		expect(resolveAiConfig({ limits: { cooldown: "10s" } }).limits.cooldown).toBe(10_000);
	});

	test("入れ子の部分指定でも他の項目が消えない", () => {
		const config = resolveAiConfig({
			stream: { intervalMs: 500 },
			memory: { maxMessages: 4 },
			tools: { enabled: false },
			limits: { maxResponseLength: 100 },
			display: { ephemeral: true },
		});
		expect(config.stream).toEqual({ enabled: true, intervalMs: 500, cursor: "▌" });
		expect(config.memory.maxMessages).toBe(4);
		expect(config.memory.ttl).toBe(3_600_000);
		expect(config.memory.enabled).toBe(true);
		expect(config.tools).toEqual({ enabled: false, timeout: 30_000 });
		expect(config.limits).toEqual({
			maxPromptLength: 4_000,
			maxResponseLength: 100,
			cooldown: false,
		});
		expect(config.display.ephemeral).toBe(true);
		expect(config.display.embeds).toBe(true);
		expect(config.display.splitThreshold).toBe("auto");
	});

	test("カーソルは空文字にできる(記号を出さない)", () => {
		expect(resolveAiConfig({ stream: { cursor: "" } }).stream.cursor).toBe("");
	});

	test("decorate と store は指定したものがそのまま入る", () => {
		const decorate = (embed: EmbedBuilder) => embed;
		const store = new MapMemoryStore();
		const config = resolveAiConfig({ display: { decorate }, memory: { store } });
		expect(config.display.decorate).toBe(decorate);
		expect(config.memory.store).toBe(store);
		// 指定しても他の項目は消えない。
		expect(config.display.embeds).toBe(true);
		expect(config.memory.maxMessages).toBe(20);
	});

	test("splitThreshold は明示指定が既定の計算に勝つ", () => {
		expect(resolveAiConfig({ display: { splitThreshold: 900 } }).display.splitThreshold).toBe(900);
		expect(
			resolveAiConfig({ display: { embeds: false, splitThreshold: 900 } }).display.splitThreshold,
		).toBe(900);
		// 明示していないことも区別できる(呼び出しごとの embeds に追従するため)。
		expect(resolveAiConfig().display.splitThreshold).toBe("auto");
	});

	test("allowedMentions は差し替えも null も指定できる", () => {
		expect(
			resolveAiConfig({ display: { allowedMentions: { parse: ["users"] } } }).display
				.allowedMentions,
		).toEqual({ parse: ["users"] });
		// null は「discord.js の既定に任せる」という明示。
		const relaxed = resolveAiConfig({ display: { allowedMentions: null } });
		expect(relaxed.display.allowedMentions).toBeNull();
		// 指定しても他の項目は消えない。
		expect(relaxed.display.embeds).toBe(true);
	});

	test("payload は指定したものがそのまま入る", () => {
		const payload = (value: AiMessagePayload) => value;
		const config = resolveAiConfig({ display: { payload } });
		expect(config.display.payload).toBe(payload);
		// 指定しても他の項目は消えない。
		expect(config.display.embeds).toBe(true);
	});
});

describe("文言カタログ", () => {
	test("指定した文言だけが上書きされ、残りは既定のまま", () => {
		const texts = resolveAiTexts({ thinking: "考え中" });
		expect(texts.thinking).toBe("考え中");
		expect(texts.emptyResponse).toBe(defaultAiTexts.emptyResponse);
		expect(texts.answerBody).toBe(defaultAiTexts.answerBody);
	});

	test("何も指定しなければ既定と一致する", () => {
		expect(resolveAiTexts()).toEqual(defaultAiTexts);
	});

	test("answerBody を差し替えると本文の組み立てごと変わる", () => {
		const texts = resolveAiTexts({
			answerBody: ({ answer, tools, usage }) => [answer, ...tools, usage ?? ""].join(" | "),
		});
		expect(
			texts.answerBody(
				{
					answer: "答え",
					cursor: null,
					sources: [],
					tools: ["`t`"],
					usage: "10",
					rawSources: [],
					rawTools: ["t"],
					rawUsage: null,
					streaming: false,
					failure: null,
				},
				texts,
			),
		).toBe("答え | `t` | 10");
	});

	test("既定の answerBody は本文と引用元だけを並べる", () => {
		const body = defaultAiTexts.answerBody(
			{
				answer: "答え",
				cursor: "▌",
				sources: ["`1.` [題](https://example.com)"],
				tools: ["`t`"],
				usage: "トークン",
				rawSources: [],
				rawTools: ["t"],
				rawUsage: null,
				streaming: true,
				failure: null,
			},
			defaultAiTexts,
		);
		expect(body).toBe("答え▌\n\n**引用元:**\n`1.` [題](https://example.com)");
	});

	test("本文が空なら仮表示になる", () => {
		expect(
			defaultAiTexts.answerBody(
				{
					answer: "",
					cursor: null,
					sources: [],
					tools: [],
					usage: null,
					rawSources: [],
					rawTools: [],
					rawUsage: null,
					streaming: true,
					failure: null,
				},
				defaultAiTexts,
			),
		).toBe(defaultAiTexts.thinking);
	});
});

describe("配り方", () => {
	test("コンテナ経由で配られる", async () => {
		const client = createAiClient({ maxSteps: 2 });
		await client.load();
		expect(client.container.aiConfig.maxSteps).toBe(2);
		expect(client.container.services.ai.config).toBe(client.container.aiConfig);
		await client.destroy();
	});

	test("クライアント2つで設定が混ざらない", async () => {
		const a = createAiClient({ texts: { thinking: "Aで考え中" }, stream: { intervalMs: 10 } });
		const b = createAiClient({ texts: { thinking: "Bで考え中" }, stream: { intervalMs: 20 } });
		await a.load();
		await b.load();

		expect(a.container.aiConfig.texts.thinking).toBe("Aで考え中");
		expect(b.container.aiConfig.texts.thinking).toBe("Bで考え中");
		expect(a.container.aiConfig.stream.intervalMs).toBe(10);
		expect(b.container.aiConfig.stream.intervalMs).toBe(20);
		// 既定のカタログ自体が汚染されていないこと。
		expect(defaultAiTexts.thinking).toBe("考えています…");
		await a.destroy();
		await b.destroy();
	});

	test("ai ストアが登録され、services.ai が生える", async () => {
		const client = createAiClient();
		await client.load();
		expect(client.stores.get("ai")).toBeDefined();
		expect(client.container.services.ai).toBeDefined();
		await client.destroy();
	});

	test("コマンドは1つも登録しない(Bot の機能は Bot 側で書く)", async () => {
		const client = createAiClient({ model: "google:gemini-2.5-flash" });
		await client.load();
		expect([...client.stores.get("commands").keys()]).toEqual([]);
		await client.destroy();
	});
});
