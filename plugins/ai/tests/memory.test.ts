/**
 * 会話履歴の検証。**ネットワークにも API キーにも触りません。**
 */
import { describe, expect, test } from "bun:test";
import type { ModelMessage } from "ai";
import { MapMemoryStore, type AiMemoryStore } from "../src/index.js";
import { createAiClient, mockModel } from "./helpers.js";

function messages(...contents: string[]): ModelMessage[] {
	return contents.map((content) => ({ role: "user", content }));
}

describe("MapMemoryStore", () => {
	test("追記した順に返り、消せる", () => {
		const store = new MapMemoryStore();
		expect(store.get("c1")).toEqual([]);

		store.append("c1", messages("1", "2"));
		store.append("c1", messages("3"));
		expect(store.get("c1").map((m) => m.content)).toEqual(["1", "2", "3"]);

		store.clear("c1");
		expect(store.get("c1")).toEqual([]);
		expect(store.size).toBe(0);
	});

	test("キーごとに独立している", () => {
		const store = new MapMemoryStore();
		store.append("c1", messages("A"));
		store.append("c2", messages("B"));
		expect(store.get("c1").map((m) => m.content)).toEqual(["A"]);
		expect(store.get("c2").map((m) => m.content)).toEqual(["B"]);
	});

	test("既定の maxMessages は 20", () => {
		const store = new MapMemoryStore();
		store.append("c1", messages(...Array.from({ length: 30 }, (_, i) => String(i))));
		expect(store.get("c1").length).toBe(20);
		expect(store.get("c1")[0]?.content).toBe("10");
	});

	test("maxMessages を差し替えると古いものから捨てられる", () => {
		const store = new MapMemoryStore({ maxMessages: 2 });
		store.append("c1", messages("1", "2", "3"));
		expect(store.get("c1").map((m) => m.content)).toEqual(["2", "3"]);
	});

	test("maxMessages: 0 なら何も覚えない", () => {
		const store = new MapMemoryStore({ maxMessages: 0 });
		store.append("c1", messages("1"));
		expect(store.get("c1")).toEqual([]);
	});

	test("既定では期限切れしない", async () => {
		const store = new MapMemoryStore();
		store.append("c1", messages("残る"));
		await Bun.sleep(20);
		expect(store.get("c1").length).toBe(1);
	});

	test("ttl を過ぎたら取得時に捨てられる(タイマーを持たない)", async () => {
		const store = new MapMemoryStore({ ttl: 10 });
		store.append("c1", messages("消える"));
		expect(store.get("c1").length).toBe(1);
		await Bun.sleep(20);
		expect(store.get("c1")).toEqual([]);
		expect(store.size).toBe(0);
	});

	test("返る配列を書き換えても中の履歴は壊れない", () => {
		const store = new MapMemoryStore();
		store.append("c1", messages("1"));
		store.get("c1").push(...messages("2"));
		expect(store.get("c1").length).toBe(1);
	});
});

describe("AiService の履歴", () => {
	test("history を指定した呼び出しだけが溜まる", async () => {
		const client = createAiClient({ model: mockModel("はい") });
		await client.load();
		const ai = client.container.services.ai;

		await ai.ask("履歴なし");
		expect(await ai.history("c1")).toEqual([]);

		await ai.ask("履歴あり", { history: "c1" });
		expect((await ai.history("c1")).map((m) => m.content)).toEqual(["履歴あり", "はい"]);
		await client.destroy();
	});

	test("溜まった履歴が次の呼び出しへ前置きされる", async () => {
		const client = createAiClient({ model: mockModel("はい") });
		await client.load();
		const ai = client.container.services.ai;

		await ai.ask("1回目", { history: "c1" });
		const result = await ai.generate({ prompt: "2回目", history: "c1" });
		expect(result.steps[0]?.response.messages.length).toBeGreaterThan(0);
		expect((await ai.history("c1")).map((m) => m.content)).toEqual([
			"1回目",
			"はい",
			"2回目",
			"はい",
		]);
		await client.destroy();
	});

	test("maxMessages で切られる", async () => {
		const client = createAiClient({ model: mockModel("はい"), memory: { maxMessages: 2 } });
		await client.load();
		const ai = client.container.services.ai;

		await ai.ask("1", { history: "c1" });
		await ai.ask("2", { history: "c1" });
		expect((await ai.history("c1")).map((m) => m.content)).toEqual(["2", "はい"]);
		await client.destroy();
	});

	test("store が多く返しても maxMessages で切って渡す", async () => {
		const many: ModelMessage[] = messages("1", "2", "3", "4", "5");
		const store: AiMemoryStore = {
			get: () => [...many],
			append: () => undefined,
			clear: () => undefined,
		};
		const client = createAiClient({
			model: mockModel("はい"),
			memory: { store, maxMessages: 2 },
		});
		await client.load();

		expect((await client.container.services.ai.history("c1")).map((m) => m.content)).toEqual([
			"4",
			"5",
		]);
		await client.destroy();
	});

	test("memory.enabled: false なら store へ触りもしない", async () => {
		const calls: string[] = [];
		const store: AiMemoryStore = {
			get: (key) => {
				calls.push(`get:${key}`);
				return [];
			},
			append: (key) => {
				calls.push(`append:${key}`);
			},
			clear: (key) => {
				calls.push(`clear:${key}`);
			},
		};
		const client = createAiClient({
			model: mockModel("はい"),
			memory: { enabled: false, store },
		});
		await client.load();

		await client.container.services.ai.ask("溜まらない", { history: "c1" });
		expect(calls).toEqual([]);
		await client.destroy();
	});

	test("forget で消え、消すものが無ければ false", async () => {
		const client = createAiClient({ model: mockModel("はい") });
		await client.load();
		const ai = client.container.services.ai;

		expect(await ai.forget("c1")).toBe(false);
		await ai.ask("溜める", { history: "c1" });
		expect(await ai.forget("c1")).toBe(true);
		expect(await ai.history("c1")).toEqual([]);
		await client.destroy();
	});

	test("チャンネルごとに独立している", async () => {
		const client = createAiClient({ model: mockModel("はい") });
		await client.load();
		const ai = client.container.services.ai;

		await ai.ask("Aの話", { history: "c1" });
		await ai.ask("Bの話", { history: "c2" });
		expect((await ai.history("c1"))[0]?.content).toBe("Aの話");
		expect((await ai.history("c2"))[0]?.content).toBe("Bの話");
		await client.destroy();
	});

	test("memory.enabled: false なら履歴を使わない", async () => {
		const client = createAiClient({ model: mockModel("はい"), memory: { enabled: false } });
		await client.load();
		const ai = client.container.services.ai;

		await ai.ask("溜まらない", { history: "c1" });
		expect(await ai.history("c1")).toEqual([]);
		await client.destroy();
	});

	test("store を差し替えるとそちらへ書かれる", async () => {
		const calls: string[] = [];
		const store: AiMemoryStore = {
			get: (key) => {
				calls.push(`get:${key}`);
				return [];
			},
			append: (key, msgs) => {
				calls.push(`append:${key}:${msgs.length}`);
			},
			clear: (key) => {
				calls.push(`clear:${key}`);
			},
		};
		const client = createAiClient({ model: mockModel("はい"), memory: { store } });
		await client.load();
		const ai = client.container.services.ai;

		expect(ai.memory).toBe(store);
		await ai.ask("やあ", { history: "c1" });
		await ai.forget("c1");
		expect(calls).toEqual(["get:c1", "append:c1:2", "get:c1", "clear:c1"]);
		await client.destroy();
	});

	test("既定の store はクライアントごとに別物(混ざらない)", async () => {
		const a = createAiClient({ model: mockModel("A") });
		const b = createAiClient({ model: mockModel("B") });
		await a.load();
		await b.load();

		await a.container.services.ai.ask("Aの話", { history: "c1" });
		expect(await b.container.services.ai.history("c1")).toEqual([]);
		await a.destroy();
		await b.destroy();
	});

	test("履歴の読み出しが失敗しても生成は続く", async () => {
		const store: AiMemoryStore = {
			get: () => {
				throw new Error("読めない");
			},
			append: () => undefined,
			clear: () => undefined,
		};
		const client = createAiClient({ model: mockModel("それでも答える"), memory: { store } });
		await client.load();
		// aiError を購読して既定動作(ログ)を止める。
		const seen: string[] = [];
		client.on("aiError", (_error, info) => seen.push(info.phase));

		expect(await client.container.services.ai.ask("やあ", { history: "c1" })).toBe(
			"それでも答える",
		);
		expect(seen).toContain("memory");
		await client.destroy();
	});
});
