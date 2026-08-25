import { describe, expect, test } from "bun:test";
import {
	EmbedBuilder,
	type ActionRowBuilder,
	type BaseMessageOptions,
	type ButtonBuilder,
	type Message,
	type RepliableInteraction,
} from "@cc-discord-framework/core";
import { confirm, createEmbeds, defaultTheme, paginate, paginationRow } from "../src/index.js";

const embeds = createEmbeds();
const colors = defaultTheme.colors;

interface RowJson {
	components: { custom_id?: string; label?: string; disabled?: boolean }[];
}

function rowOf(payload: BaseMessageOptions): RowJson {
	const row = payload.components?.[0] as ActionRowBuilder<ButtonBuilder> | undefined;
	if (!row) throw new Error("components がありません");
	return row.toJSON() as unknown as RowJson;
}

const idsOf = (payload: BaseMessageOptions) =>
	rowOf(payload).components.map((component) => component.custom_id ?? "");

/** インタラクション経由の送信を記録するだけの偽物。 */
function fakeTarget(message: Message) {
	const sent: BaseMessageOptions[] = [];
	const edits: BaseMessageOptions[] = [];
	const target = {
		deferred: false,
		replied: false,
		user: { id: "invoker" },
		reply: async (payload: BaseMessageOptions) => {
			sent.push(payload);
		},
		fetchReply: async () => message,
		editReply: async (payload: BaseMessageOptions) => {
			edits.push(payload);
			return message;
		},
	} as unknown as RepliableInteraction;
	return { target, sent, edits };
}

describe("createEmbeds", () => {
	test("用途ごとの色を付ける", () => {
		expect(embeds.success("完了").toJSON().color).toBe(colors.success);
		expect(embeds.error("失敗").toJSON().color).toBe(colors.error);
		expect(embeds.warning().toJSON().color).toBe(colors.warning);
		expect(embeds.info().toJSON().color).toBe(colors.info);
	});

	test("説明文は任意で、Error はメッセージになる", () => {
		expect(embeds.info().toJSON().description).toBeUndefined();
		expect(embeds.info("案内").toJSON().description).toBe("案内");
		expect(embeds.error(new Error("壊れました")).toJSON().description).toBe("壊れました");
	});

	test("EmbedBuilder なのでそのままチェーンできる", () => {
		const embed = embeds.success("保存しました").setTitle("設定");
		expect(embed).toBeInstanceOf(EmbedBuilder);
		expect(embed.toJSON().title).toBe("設定");
	});

	test("of は色名でも色コードでも受ける", () => {
		expect(embeds.of("warning").toJSON().color).toBe(colors.warning);
		expect(embeds.of(0x123456).toJSON().color).toBe(0x123456);
	});

	test("テーマの色を指定できる", () => {
		const custom = createEmbeds({ colors: { success: 0x00ffaa } });
		expect(custom.success().toJSON().color).toBe(0x00ffaa);
		// 指定しなかった色は既定のまま
		expect(custom.error().toJSON().color).toBe(colors.error);
	});
});

describe("paginationRow", () => {
	test("先頭では戻る系だけ無効", () => {
		const row = paginationRow(1, 3, "x").toJSON() as unknown as RowJson;
		expect(row.components.map((component) => component.disabled)).toEqual([
			true,
			true,
			true,
			false,
			false,
		]);
	});

	test("末尾では進む系だけ無効", () => {
		const row = paginationRow(3, 3, "x").toJSON() as unknown as RowJson;
		expect(row.components.map((component) => component.disabled)).toEqual([
			false,
			false,
			true,
			true,
			true,
		]);
	});

	test("disabled ですべて無効にできる", () => {
		const row = paginationRow(2, 3, "x", { disabled: true }).toJSON() as unknown as RowJson;
		expect(row.components.every((component) => component.disabled)).toBe(true);
	});

	test("現在位置を表示し、id に接頭辞が付く", () => {
		const row = paginationRow(2, 5, "abc").toJSON() as unknown as RowJson;
		expect(row.components[2]?.label).toBe("2 / 5");
		expect(row.components.map((component) => component.custom_id)).toEqual([
			"abc:first",
			"abc:prev",
			"abc:page",
			"abc:next",
			"abc:last",
		]);
	});
});

describe("confirm", () => {
	function setup(behavior: (filter: (i: unknown) => boolean) => Promise<unknown>) {
		const updated: BaseMessageOptions[] = [];
		let capturedFilter: ((i: unknown) => boolean) | null = null;
		const message = {
			awaitMessageComponent: (options: { filter: (i: unknown) => boolean }) => {
				capturedFilter = options.filter;
				return behavior(options.filter);
			},
		} as unknown as Message;
		return { message, updated, filter: () => capturedFilter };
	}

	test("承認ボタンで true、ボタンは無効化される", async () => {
		const updated: BaseMessageOptions[] = [];
		let ids: string[] = [];
		const message = {
			awaitMessageComponent: async () => ({
				customId: ids[0],
				user: { id: "invoker" },
				update: async (payload: BaseMessageOptions) => {
					updated.push(payload);
				},
			}),
		} as unknown as Message;

		const { target, sent } = fakeTarget(message);
		const promise = confirm(target, { content: "実行しますか?" });
		await Promise.resolve();
		ids = idsOf(sent[0] as BaseMessageOptions);

		expect(await promise).toBe(true);
		expect(sent[0]?.content).toBe("実行しますか?");
		expect(rowOf(sent[0] as BaseMessageOptions).components.every((c) => c.disabled)).toBe(false);
		expect(rowOf(updated[0] as BaseMessageOptions).components.every((c) => c.disabled)).toBe(true);
	});

	test("拒否ボタンで false", async () => {
		let ids: string[] = [];
		const message = {
			awaitMessageComponent: async () => ({
				customId: ids[1],
				user: { id: "invoker" },
				update: async () => undefined,
			}),
		} as unknown as Message;

		const { target, sent } = fakeTarget(message);
		const promise = confirm(target);
		await Promise.resolve();
		ids = idsOf(sent[0] as BaseMessageOptions);

		expect(await promise).toBe(false);
	});

	test("時間切れは false、ボタンを無効化して閉じる", async () => {
		const message = {
			awaitMessageComponent: async () => {
				throw new Error("time");
			},
		} as unknown as Message;

		const { target, edits } = fakeTarget(message);
		expect(await confirm(target, { timeout: "1s" })).toBe(false);
		expect(rowOf(edits[0] as BaseMessageOptions).components.every((c) => c.disabled)).toBe(true);
	});

	test("既定では呼び出したユーザーしか押せない", async () => {
		const { message, filter } = setup(async () => {
			throw new Error("time");
		});
		const { target, sent } = fakeTarget(message);
		await confirm(target);

		const [yesId] = idsOf(sent[0] as BaseMessageOptions);
		const check = filter();
		expect(check).not.toBeNull();
		expect(check?.({ customId: yesId, user: { id: "invoker" } })).toBe(true);
		expect(check?.({ customId: yesId, user: { id: "someone" } })).toBe(false);
		expect(check?.({ customId: "other:yes", user: { id: "invoker" } })).toBe(false);
	});

	test("anyone なら誰でも押せる", async () => {
		const { message, filter } = setup(async () => {
			throw new Error("time");
		});
		const { target, sent } = fakeTarget(message);
		await confirm(target, { anyone: true });

		const [yesId] = idsOf(sent[0] as BaseMessageOptions);
		expect(filter()?.({ customId: yesId, user: { id: "someone" } })).toBe(true);
	});
});

describe("paginate", () => {
	type Handler = (...args: unknown[]) => unknown;

	function fakeCollector() {
		const handlers = new Map<string, Handler[]>();
		const collector = {
			on(event: string, handler: Handler) {
				handlers.set(event, [...(handlers.get(event) ?? []), handler]);
				return collector;
			},
			async fire(event: string, ...args: unknown[]) {
				for (const handler of handlers.get(event) ?? []) await handler(...args);
			},
		};
		return collector;
	}

	function setup() {
		const collector = fakeCollector();
		let options: { filter: (i: unknown) => boolean; idle: number } | null = null;
		const message = {
			createMessageComponentCollector: (given: { filter: (i: unknown) => boolean; idle: number }) => {
				options = given;
				return collector;
			},
		} as unknown as Message;
		const target = fakeTarget(message);
		return { ...target, collector, collectorOptions: () => options };
	}

	test("1ページならボタンを付けない", async () => {
		const { target, sent } = setup();
		await paginate(target, { pages: ["だけ"] });
		expect(sent[0]?.content).toBe("だけ");
		expect(sent[0]?.components).toBeUndefined();
	});

	test("ページが無ければ拒否する", async () => {
		const { target } = setup();
		expect(paginate(target, { pages: [] })).rejects.toThrow(RangeError);
	});

	test("startPage は範囲内へ丸める", async () => {
		const { target, sent } = setup();
		await paginate(target, { pages: ["1", "2", "3"], startPage: 99 });
		expect(sent[0]?.content).toBe("3");
		expect(rowOf(sent[0] as BaseMessageOptions).components[2]?.label).toBe("3 / 3");
	});

	test("ボタンでページを移動する", async () => {
		const { target, sent, collector } = setup();
		await paginate(target, { pages: ["一", "二", "三"] });

		const [firstId, prevId, , nextId, lastId] = idsOf(sent[0] as BaseMessageOptions);
		const updated: BaseMessageOptions[] = [];
		const press = (customId: string) =>
			collector.fire("collect", {
				customId,
				update: async (payload: BaseMessageOptions) => {
					updated.push(payload);
				},
			});

		await press(nextId as string);
		expect(updated.at(-1)?.content).toBe("二");

		await press(lastId as string);
		expect(updated.at(-1)?.content).toBe("三");

		await press(nextId as string); // 末尾で進んでも溢れない
		expect(updated.at(-1)?.content).toBe("三");

		await press(prevId as string);
		expect(updated.at(-1)?.content).toBe("二");

		await press(firstId as string);
		expect(updated.at(-1)?.content).toBe("一");
		expect(rowOf(updated.at(-1) as BaseMessageOptions).components[2]?.label).toBe("1 / 3");
	});

	test("埋め込みページと文字列ページを混ぜても残らない", async () => {
		const { target, sent, collector } = setup();
		await paginate(target, { pages: [embeds.info("埋め込み"), "文字列"] });

		expect(sent[0]?.content).toBe("");
		expect(sent[0]?.embeds).toHaveLength(1);

		const ids = idsOf(sent[0] as BaseMessageOptions);
		const updated: BaseMessageOptions[] = [];
		await collector.fire("collect", {
			customId: ids[3],
			update: async (payload: BaseMessageOptions) => {
				updated.push(payload);
			},
		});

		expect(updated[0]?.content).toBe("文字列");
		expect(updated[0]?.embeds).toEqual([]);
	});

	test("終了時にボタンを無効化する", async () => {
		const { target, edits, collector } = setup();
		await paginate(target, { pages: ["一", "二"] });

		await collector.fire("end");
		await Promise.resolve();
		expect(rowOf(edits[0] as BaseMessageOptions).components.every((c) => c.disabled)).toBe(true);
	});

	test("既定では呼び出したユーザーだけが操作できる", async () => {
		const { target, sent, collectorOptions } = setup();
		await paginate(target, { pages: ["一", "二"], timeout: "30s" });

		const options = collectorOptions();
		expect(options?.idle).toBe(30_000);

		const [firstId] = idsOf(sent[0] as BaseMessageOptions);
		expect(options?.filter({ customId: firstId, user: { id: "invoker" } })).toBe(true);
		expect(options?.filter({ customId: firstId, user: { id: "someone" } })).toBe(false);
	});
});
