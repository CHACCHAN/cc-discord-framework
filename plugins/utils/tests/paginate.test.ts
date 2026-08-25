/**
 * paginate() — ボタンによるページ送りの回帰テスト。
 *
 * Discord には触らず、paginate() が実際に呼ぶものだけ
 * (interaction の reply 系と message.createMessageComponentCollector)を
 * 偽物にして、コレクターのイベントを手で発火させる。
 */
import { describe, expect, test } from "bun:test";
import {
	EmbedBuilder,
	type ActionRowBuilder,
	type BaseMessageOptions,
	type ButtonBuilder,
	type Message,
	type RepliableInteraction,
} from "cc-discord-framework";
import { paginate, resolveTheme, type Theme } from "../src/index.js";

interface ButtonJson {
	custom_id?: string;
	label?: string;
	style?: number;
	disabled?: boolean;
}

function buttonsOf(payload: BaseMessageOptions | undefined): ButtonJson[] {
	const row = payload?.components?.[0] as ActionRowBuilder<ButtonBuilder> | undefined;
	if (!row) throw new Error("components がありません");
	return (row.toJSON() as unknown as { components: ButtonJson[] }).components;
}

const disabledOf = (payload: BaseMessageOptions | undefined) =>
	buttonsOf(payload).map((button) => button.disabled ?? false);

const descriptionOf = (payload: BaseMessageOptions | undefined) =>
	(payload?.embeds?.[0] as EmbedBuilder | undefined)?.data.description;

interface CollectorOptions {
	componentType: number;
	idle: number;
	filter: (interaction: unknown) => boolean;
}

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
			await Bun.sleep(0); // "end" の void 編集を流しきる
		},
	};
	return collector;
}

/** paginate() が触るものだけを備えた偽のインタラクションと操作口。 */
function setup(options: { clientTheme?: Theme; failEdits?: boolean } = {}) {
	const sent: BaseMessageOptions[] = [];
	const edits: BaseMessageOptions[] = [];
	const updates: BaseMessageOptions[] = [];
	const collector = fakeCollector();
	let created = 0;
	let collectorOptions: CollectorOptions | null = null;

	const message = {
		createMessageComponentCollector: (given: CollectorOptions) => {
			created += 1;
			collectorOptions = given;
			return collector;
		},
	} as unknown as Message;

	const target = {
		client: options.clientTheme ? { container: { theme: options.clientTheme } } : undefined,
		deferred: false,
		replied: false,
		user: { id: "invoker" },
		reply: async (payload: BaseMessageOptions) => {
			sent.push(payload);
		},
		fetchReply: async () => message,
		editReply: async (payload: BaseMessageOptions) => {
			if (options.failEdits) throw new Error("編集できません");
			edits.push(payload);
			return message;
		},
	} as unknown as RepliableInteraction;

	/** 送信済みの行から `first` の customId を取り、接頭辞へ戻す。 */
	const idPrefix = () => {
		const first = buttonsOf(sent[0])[0]?.custom_id ?? "";
		return first.replace(/:first$/, "");
	};
	/** アクション名(first/prev/next/last)でボタンを押す。 */
	const press = (action: string, failUpdate = false) =>
		collector.fire("collect", {
			customId: `${idPrefix()}:${action}`,
			user: { id: "invoker" },
			update: async (payload: BaseMessageOptions) => {
				if (failUpdate) throw new Error("update できません");
				updates.push(payload);
			},
		});

	return {
		target,
		message,
		sent,
		edits,
		updates,
		collector,
		press,
		created: () => created,
		collectorOptions: () => collectorOptions,
	};
}

const embedPages = (total: number) =>
	Array.from({ length: total }, (_, index) =>
		new EmbedBuilder().setDescription(`${index + 1}ページ目`),
	);

describe("paginate: 送信とボタンの状態", () => {
	test("1ページならボタンもコレクターも付けない", async () => {
		const { target, message, sent, created } = setup();
		const result = await paginate(target, { pages: ["これだけ"] });

		expect(result).toBe(message);
		expect(sent[0]?.content).toBe("これだけ");
		expect(sent[0]?.components).toBeUndefined();
		expect(created()).toBe(0);
	});

	test("ページが無ければ拒否する", async () => {
		const { target } = setup();
		expect(paginate(target, { pages: [] })).rejects.toThrow(RangeError);
	});

	test("オブジェクトページのメッセージ設定を初回・更新・終了時に保つ", async () => {
		const { target, sent, updates, edits, press, collector } = setup();
		await paginate(target, {
			pages: [
				{
					content: "@everyone",
					allowedMentions: { parse: [] },
					files: ["first.txt"],
				},
				{
					content: "<@123456789012345678>",
					allowedMentions: { users: ["123456789012345678"] },
					files: ["second.txt"],
				},
			],
		});

		expect(sent[0]?.allowedMentions).toEqual({ parse: [] });
		expect(sent[0]?.files).toEqual(["first.txt"]);

		await press("next");
		expect(updates[0]?.allowedMentions).toEqual({ users: ["123456789012345678"] });
		expect(updates[0]?.files).toEqual(["second.txt"]);

		await collector.fire("end");
		expect(edits[0]?.allowedMentions).toEqual({ users: ["123456789012345678"] });
		expect(edits[0]?.files).toEqual(["second.txt"]);
	});

	test("先頭ページでは戻る系だけ無効(中央の現在位置は常に無効)", async () => {
		const { target, sent } = setup();
		await paginate(target, { pages: ["1", "2", "3"] });
		expect(disabledOf(sent[0])).toEqual([true, true, true, false, false]);
	});

	test("末尾から始めると進む系だけ無効", async () => {
		const { target, sent } = setup();
		await paginate(target, { pages: ["1", "2", "3"], startPage: 3 });
		expect(disabledOf(sent[0])).toEqual([false, false, true, true, true]);
	});

	test("startPage は 1〜ページ数へ丸め、小数は切り捨てる", async () => {
		const low = setup();
		await paginate(low.target, { pages: ["1", "2", "3"], startPage: 0 });
		expect(low.sent[0]?.content).toBe("1");

		const high = setup();
		await paginate(high.target, { pages: ["1", "2", "3"], startPage: 99 });
		expect(high.sent[0]?.content).toBe("3");

		const fraction = setup();
		await paginate(fraction.target, { pages: ["1", "2", "3"], startPage: 2.9 });
		expect(fraction.sent[0]?.content).toBe("2");
	});
});

describe("paginate: ページ送り", () => {
	test("next/prev/first/last で埋め込みと現在位置が更新される", async () => {
		const { target, sent, updates, press } = setup();
		await paginate(target, { pages: embedPages(3) });

		expect(descriptionOf(sent[0])).toBe("1ページ目");
		expect(buttonsOf(sent[0])[2]?.label).toBe("1 / 3");

		await press("next");
		expect(descriptionOf(updates.at(-1))).toBe("2ページ目");
		expect(buttonsOf(updates.at(-1))[2]?.label).toBe("2 / 3");
		expect(disabledOf(updates.at(-1))).toEqual([false, false, true, false, false]);

		await press("last");
		expect(descriptionOf(updates.at(-1))).toBe("3ページ目");
		expect(disabledOf(updates.at(-1))).toEqual([false, false, true, true, true]);

		await press("next"); // 末尾で進んでも溢れない
		expect(descriptionOf(updates.at(-1))).toBe("3ページ目");

		await press("prev");
		expect(descriptionOf(updates.at(-1))).toBe("2ページ目");

		await press("first");
		expect(descriptionOf(updates.at(-1))).toBe("1ページ目");
		expect(buttonsOf(updates.at(-1))[2]?.label).toBe("1 / 3");
		expect(disabledOf(updates.at(-1))).toEqual([true, true, true, false, false]);
	});

	test("知らないボタン(現在位置ボタンなど)では何もしない", async () => {
		const { target, updates, press } = setup();
		await paginate(target, { pages: ["1", "2"] });

		await press("page");
		expect(updates).toHaveLength(0);
	});

	test("押下後の update に失敗しても止まらない(消えた場合)", async () => {
		const { target, updates, press } = setup();
		await paginate(target, { pages: ["1", "2"] });

		await press("next", true); // 失敗しても throw しない
		await press("next");
		expect(updates.at(-1)?.content).toBe("2");
	});
});

describe("paginate: テーマと見た目", () => {
	test("現在位置の表示は theme オプションで変えられる", async () => {
		const { target, sent } = setup();
		await paginate(target, {
			pages: ["1", "2", "3"],
			theme: { pagination: { counter: (current, total) => `${current}枚目 / 全${total}枚` } },
		});
		expect(buttonsOf(sent[0])[2]?.label).toBe("1枚目 / 全3枚");
	});

	test("クライアントのテーマが効き、呼び出し側の指定が優先される", async () => {
		const clientTheme = resolveTheme({
			pagination: { next: { label: "NEXT" }, counter: (current, total) => `${current}⁄${total}` },
		});
		const { target, sent } = setup({ clientTheme });
		await paginate(target, {
			pages: ["1", "2", "3"],
			counter: (current, total) => `${current}:${total}`, // その場の上書きが勝つ
		});

		const row = buttonsOf(sent[0]);
		expect(row[3]?.label).toBe("NEXT"); // クライアントの utils({ theme })
		expect(row[2]?.label).toBe("1:3");
	});
});

describe("paginate: 時間切れと後片付け", () => {
	test("無操作の待ち時間は idle で渡り、テーマ既定は 2m", async () => {
		const byDefault = setup();
		await paginate(byDefault.target, { pages: ["1", "2"] });
		expect(byDefault.collectorOptions()?.idle).toBe(120_000);

		const overridden = setup();
		await paginate(overridden.target, { pages: ["1", "2"], timeout: "30s" });
		expect(overridden.collectorOptions()?.idle).toBe(30_000);
	});

	test("終了時は現在のページのままボタンを無効化する", async () => {
		const { target, edits, updates, press, collector } = setup();
		await paginate(target, { pages: embedPages(3) });

		await press("next");
		await collector.fire("end");

		expect(descriptionOf(edits[0])).toBe("2ページ目"); // 見ていたページのまま
		expect(disabledOf(edits[0])).toEqual([true, true, true, true, true]);
		expect(updates).toHaveLength(1); // update ではなく元メッセージの編集で閉じる
	});

	test("終了時の編集に失敗しても落ちない(消えた場合)", async () => {
		const { target, collector } = setup({ failEdits: true });
		await paginate(target, { pages: ["1", "2"] });
		await collector.fire("end"); // throw も unhandled rejection も出ない
	});
});

describe("paginate: 押せる人", () => {
	test("既定では呼び出したユーザーの、このページ送りのボタンだけを受ける", async () => {
		const { target, sent, collectorOptions } = setup();
		await paginate(target, { pages: ["1", "2"] });

		const [firstId] = buttonsOf(sent[0]).map((button) => button.custom_id ?? "");
		const filter = collectorOptions()?.filter;
		expect(filter?.({ customId: firstId, user: { id: "invoker" } })).toBe(true);
		expect(filter?.({ customId: firstId, user: { id: "someone" } })).toBe(false);
		expect(filter?.({ customId: "other:first", user: { id: "invoker" } })).toBe(false);
	});

	test("userId を指定するとその人だけが操作できる", async () => {
		const { target, sent, collectorOptions } = setup();
		await paginate(target, { pages: ["1", "2"], userId: "moderator" });

		const [firstId] = buttonsOf(sent[0]).map((button) => button.custom_id ?? "");
		const filter = collectorOptions()?.filter;
		expect(filter?.({ customId: firstId, user: { id: "moderator" } })).toBe(true);
		expect(filter?.({ customId: firstId, user: { id: "invoker" } })).toBe(false);
	});

	test("anyone: true なら誰でも操作できる", async () => {
		const { target, sent, collectorOptions } = setup();
		await paginate(target, { pages: ["1", "2"], anyone: true });

		const [firstId] = buttonsOf(sent[0]).map((button) => button.custom_id ?? "");
		expect(collectorOptions()?.filter({ customId: firstId, user: { id: "someone" } })).toBe(true);
	});
});
