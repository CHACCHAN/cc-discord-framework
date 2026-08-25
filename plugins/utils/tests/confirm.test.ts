/**
 * confirm() — 2択の確認ダイアログの回帰テスト。
 *
 * Discord には触らず、confirm() が実際に呼ぶものだけ
 * (interaction の reply 系と message.awaitMessageComponent)を偽物にする。
 */
import { describe, expect, test } from "bun:test";
import {
	ButtonStyle,
	type ActionRowBuilder,
	type BaseMessageOptions,
	type ButtonBuilder,
	type Message,
	type RepliableInteraction,
} from "@cc-discord-framework/core";
import { confirm, defaultTheme, resolveTheme, type Theme } from "../src/index.js";

interface ButtonJson {
	custom_id?: string;
	label?: string;
	style?: number;
	disabled?: boolean;
	emoji?: { name?: string };
}

function buttonsOf(payload: BaseMessageOptions | undefined): ButtonJson[] {
	const row = payload?.components?.[0] as ActionRowBuilder<ButtonBuilder> | undefined;
	if (!row) throw new Error("components がありません");
	return (row.toJSON() as unknown as { components: ButtonJson[] }).components;
}

interface AwaitedOptions {
	componentType: number;
	time: number;
	filter: (interaction: unknown) => boolean;
}

interface PressedButton {
	customId: string;
	user: { id: string };
	update: (payload: BaseMessageOptions) => Promise<void>;
}

/**
 * confirm() が触るものだけを備えた偽のインタラクションと、
 * awaitMessageComponent を手で決着させる操作口。
 */
function setup(options: { clientTheme?: Theme; failEdits?: boolean } = {}) {
	const sent: BaseMessageOptions[] = [];
	const edits: BaseMessageOptions[] = [];
	const updates: BaseMessageOptions[] = [];
	let pending: {
		options: AwaitedOptions;
		resolve: (button: PressedButton) => void;
		reject: (reason: unknown) => void;
	} | null = null;

	const message = {
		awaitMessageComponent: (given: AwaitedOptions) =>
			new Promise<PressedButton>((resolve, reject) => {
				pending = { options: given, resolve, reject };
			}),
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

	/** 送信とコレクター張りが終わるまで待って、待機中の awaitMessageComponent を返す。 */
	const waitPending = async () => {
		await Bun.sleep(0);
		if (!pending) throw new Error("awaitMessageComponent が呼ばれていません");
		return pending;
	};
	/** 送信されたボタンの customId([yes, no])。 */
	const ids = async () => {
		await Bun.sleep(0);
		return buttonsOf(sent[0]).map((button) => button.custom_id ?? "");
	};
	/** ボタンを押す。update の失敗も再現できる。 */
	const press = async (customId: string, userId = "invoker", failUpdate = false) => {
		(await waitPending()).resolve({
			customId,
			user: { id: userId },
			update: async (payload) => {
				if (failUpdate) throw new Error("update できません");
				updates.push(payload);
			},
		});
	};
	/** 時間切れ(discord.js はコレクターの reject として届く)。 */
	const expire = async () => {
		(await waitPending()).reject(new Error("time"));
	};
	const awaited = async () => (await waitPending()).options;

	return { target, sent, edits, updates, ids, press, expire, awaited };
}

describe("confirm: 押下と結果", () => {
	test("承認で true になり、ボタンは無効化されて閉じる", async () => {
		const { target, sent, updates, ids, press } = setup();
		const promise = confirm(target, { content: "全件削除します。よろしいですか?" });

		const [yesId, noId] = await ids();
		expect(yesId?.endsWith(":yes")).toBe(true);
		expect(noId?.endsWith(":no")).toBe(true);
		expect(buttonsOf(sent[0]).every((button) => button.disabled === false)).toBe(true);

		await press(yesId as string);
		expect(await promise).toBe(true);

		// 決着後は同じ本文のまま、両方のボタンが無効になる。
		expect(updates[0]?.content).toBe("全件削除します。よろしいですか?");
		expect(buttonsOf(updates[0]).every((button) => button.disabled === true)).toBe(true);
	});

	test("拒否で false", async () => {
		const { target, updates, ids, press } = setup();
		const promise = confirm(target);

		const [, noId] = await ids();
		await press(noId as string);

		expect(await promise).toBe(false);
		expect(buttonsOf(updates[0]).every((button) => button.disabled === true)).toBe(true);
	});

	test("時間切れは false で、ボタンを無効化して閉じる", async () => {
		const { target, edits, expire } = setup();
		const promise = confirm(target, { content: "続けますか?" });

		await expire();
		expect(await promise).toBe(false);
		expect(edits[0]?.content).toBe("続けますか?");
		expect(buttonsOf(edits[0]).every((button) => button.disabled === true)).toBe(true);
	});

	test("時間切れ後の編集に失敗しても false のまま落ちない(消えた場合)", async () => {
		const { target, expire } = setup({ failEdits: true });
		const promise = confirm(target);

		await expire();
		expect(await promise).toBe(false);
	});

	test("押されたあとの update に失敗しても、答えは押されたボタンのまま", async () => {
		const { target, ids, press } = setup();
		const promise = confirm(target);

		const [yesId] = await ids();
		await press(yesId as string, "invoker", true);

		// 答えはボタンが押れた時点で確定。表示の後始末(無効化)が失敗しても
		// 「はい」が黙って「いいえ」に化けてはいけない。
		expect(await promise).toBe(true);
	});
});

describe("confirm: 見た目とテーマ", () => {
	test("既定のボタンはテーマ(決定 / 中止)から来る", async () => {
		const { target, sent, ids, expire } = setup();
		const promise = confirm(target);
		await ids();

		const [yes, no] = buttonsOf(sent[0]);
		expect(yes?.label).toBe(defaultTheme.confirm.yes.label);
		expect(yes?.style).toBe(ButtonStyle.Success);
		expect(no?.label).toBe(defaultTheme.confirm.no.label);
		expect(no?.style).toBe(ButtonStyle.Danger);

		await expire();
		await promise;
	});

	test("yes / no の文字列指定はラベルだけを変える", async () => {
		const { target, sent, ids, expire } = setup();
		const promise = confirm(target, { yes: "はい", no: "やめる" });
		await ids();

		const [yes, no] = buttonsOf(sent[0]);
		expect(yes?.label).toBe("はい");
		expect(yes?.style).toBe(defaultTheme.confirm.yes.style); // 色は既定のまま
		expect(no?.label).toBe("やめる");

		await expire();
		await promise;
	});

	test("色・絵文字も上書きでき、ラベルを消して絵文字だけにもできる", async () => {
		const { target, sent, ids, expire } = setup();
		const promise = confirm(target, {
			yes: { label: undefined, emoji: "✅", style: ButtonStyle.Primary },
			no: { emoji: "🛑" },
		});
		await ids();

		const [yes, no] = buttonsOf(sent[0]);
		expect(yes?.label).toBeUndefined();
		expect(yes?.emoji?.name).toBe("✅");
		expect(yes?.style).toBe(ButtonStyle.Primary);
		expect(no?.label).toBe(defaultTheme.confirm.no.label); // 部分指定なので残る
		expect(no?.emoji?.name).toBe("🛑");

		await expire();
		await promise;
	});

	test("theme オプションで confirm 全体(ラベルと待ち時間)を上書きできる", async () => {
		const { target, sent, ids, awaited, expire } = setup();
		const promise = confirm(target, {
			theme: { confirm: { yes: { label: "GO" }, timeout: "5s" } },
		});
		await ids();

		expect(buttonsOf(sent[0])[0]?.label).toBe("GO");
		expect((await awaited()).time).toBe(5_000);

		await expire();
		await promise;
	});

	test("クライアントのテーマが効き、呼び出し側の指定が優先される", async () => {
		const clientTheme = resolveTheme({
			confirm: { yes: { label: "実行" }, no: { label: "取消" } },
		});
		const { target, sent, ids, expire } = setup({ clientTheme });
		const promise = confirm(target, { no: "だめ" });
		await ids();

		const [yes, no] = buttonsOf(sent[0]);
		expect(yes?.label).toBe("実行"); // クライアントの utils({ theme })
		expect(no?.label).toBe("だめ"); // その場の上書きが勝つ

		await expire();
		await promise;
	});

	test("待ち時間はテーマ既定の 1m、timeout オプションが最優先", async () => {
		const first = setup();
		const waiting = confirm(first.target);
		expect((await first.awaited()).time).toBe(60_000);
		await first.expire();
		await waiting;

		const second = setup();
		const overridden = confirm(second.target, {
			timeout: "90s",
			theme: { confirm: { timeout: "5s" } },
		});
		expect((await second.awaited()).time).toBe(90_000);
		await second.expire();
		await overridden;
	});
});

describe("confirm: 押せる人", () => {
	test("既定では呼び出したユーザーの、この確認のボタンだけを受ける", async () => {
		const { target, ids, awaited, expire } = setup();
		const promise = confirm(target);

		const [yesId, noId] = await ids();
		const { filter } = await awaited();
		expect(filter({ customId: yesId, user: { id: "invoker" } })).toBe(true);
		expect(filter({ customId: noId, user: { id: "invoker" } })).toBe(true);
		expect(filter({ customId: yesId, user: { id: "someone" } })).toBe(false);
		expect(filter({ customId: "other:yes", user: { id: "invoker" } })).toBe(false);

		await expire();
		await promise;
	});

	test("userId を指定するとその人だけが押せる", async () => {
		const { target, ids, awaited, expire } = setup();
		const promise = confirm(target, { userId: "moderator" });

		const [yesId] = await ids();
		const { filter } = await awaited();
		expect(filter({ customId: yesId, user: { id: "moderator" } })).toBe(true);
		expect(filter({ customId: yesId, user: { id: "invoker" } })).toBe(false);

		await expire();
		await promise;
	});

	test("anyone: true なら誰でも押せる", async () => {
		const { target, ids, awaited, expire } = setup();
		const promise = confirm(target, { anyone: true });

		const [yesId] = await ids();
		const { filter } = await awaited();
		expect(filter({ customId: yesId, user: { id: "someone" } })).toBe(true);

		await expire();
		await promise;
	});
});
