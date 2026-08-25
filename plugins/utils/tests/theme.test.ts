/**
 * 「既定値は構わないが、変更できないのは駄目」という原則の回帰テスト。
 * 見た目に関わる既定値が、すべて上書きできることを固定する。
 */
import { describe, expect, test } from "bun:test";
import {
	ButtonStyle,
	Client,
	type ActionRowBuilder,
	type ButtonBuilder,
	type BaseMessageOptions,
	type Message,
	type RepliableInteraction,
} from "cc-discord-framework";
import {
	confirm,
	defaultTheme,
	humanizeDuration,
	paginationRow,
	progressBar,
	resolveTheme,
	themeOf,
	truncate,
	utils,
	type ReplyTarget,
	type ThemeOptions,
} from "../src/index.js";

interface RowJson {
	components: { custom_id?: string; label?: string; style?: number; emoji?: unknown }[];
}

const jsonOf = (row: ActionRowBuilder<ButtonBuilder>) => row.toJSON() as unknown as RowJson;

function createClient(theme?: ThemeOptions) {
	return new Client({
		intents: [],
		baseDirectory: null,
		logger: { level: "silent" },
		plugins: [utils({ theme })],
	});
}

describe("resolveTheme", () => {
	test("何も渡さなければ既定と等しい", () => {
		expect(resolveTheme()).toEqual(defaultTheme);
	});

	test("指定した項目だけを上書きし、兄弟は既定のまま", () => {
		const theme = resolveTheme({ colors: { success: 0x123456 } });
		expect(theme.colors.success).toBe(0x123456);
		expect(theme.colors.error).toBe(defaultTheme.colors.error);
		expect(theme.pagination.next).toEqual(defaultTheme.pagination.next);
	});

	test("ボタンは部分指定できる", () => {
		const theme = resolveTheme({ confirm: { yes: { label: "はい" } } });
		expect(theme.confirm.yes.label).toBe("はい");
		expect(theme.confirm.yes.style).toBe(defaultTheme.confirm.yes.style);
	});

	test("関数(counter)も差し替えられる", () => {
		const theme = resolveTheme({ pagination: { counter: (c, t) => `${c}ページ目 / 全${t}` } });
		expect(theme.pagination.counter(2, 5)).toBe("2ページ目 / 全5");
	});

	test("base を渡すとその上へ重なる", () => {
		const bot = resolveTheme({ colors: { success: 0x111111 }, confirm: { yes: { label: "はい" } } });
		const call = resolveTheme({ colors: { error: 0x222222 } }, bot);

		// 呼び出し側で指定した項目
		expect(call.colors.error).toBe(0x222222);
		// base(Bot 全体)の指定は残る
		expect(call.colors.success).toBe(0x111111);
		expect(call.confirm.yes.label).toBe("はい");
		// どちらも触っていない項目は既定
		expect(call.colors.info).toBe(defaultTheme.colors.info);
	});

	test("既定テーマを壊さない", () => {
		resolveTheme({ colors: { success: 0x000001 }, text: { ellipsis: "!" } });
		expect(defaultTheme.colors.success).not.toBe(0x000001);
		expect(defaultTheme.text.ellipsis).toBe("…");
	});
});

describe("themeOf", () => {
	test("クライアント毎にテーマを持ち、混ざらない", async () => {
		const a = createClient({ colors: { success: 0xaaaaaa } });
		const b = createClient({ colors: { success: 0xbbbbbb } });
		await a.load();
		await b.load();

		expect(a.container.theme.colors.success).toBe(0xaaaaaa);
		expect(b.container.theme.colors.success).toBe(0xbbbbbb);
		expect(themeOf({ client: a }).colors.success).toBe(0xaaaaaa);
		expect(themeOf({ client: b }).colors.success).toBe(0xbbbbbb);

		await a.destroy();
		await b.destroy();
	});

	test("テーマの無いクライアントや不明な相手は既定へ落ちる", () => {
		expect(themeOf(undefined)).toBe(defaultTheme);
		expect(themeOf({})).toBe(defaultTheme);
		expect(themeOf({ client: {} })).toBe(defaultTheme);
	});
});

describe("this.services.ui", () => {
	test("テーマの色で埋め込みを作る", async () => {
		const client = createClient({ colors: { info: 0x010203 } });
		await client.load();

		const ui = client.container.services.ui;
		expect(ui.info("案内").toJSON().color).toBe(0x010203);
		expect(ui.colors.info).toBe(0x010203);

		await client.destroy();
	});

	test("進捗バー・期間・切り詰めにテーマが効く", async () => {
		const client = createClient({
			progress: { width: 4, filled: "▰", empty: "▱" },
			duration: { units: { h: "時間", m: "分" }, separator: "", clock: { separator: "'" } },
			text: { ellipsis: "..." },
		});
		await client.load();

		const ui = client.container.services.ui;
		expect(ui.progressBar(50, 100)).toBe("▰▰▱▱");
		expect(ui.humanize(3_723_000)).toBe("1時間2分");
		expect(ui.formatDuration(83_000)).toBe("1'23");
		expect(ui.truncate("abcdef", 5)).toBe("ab...");

		// 呼び出し側の指定はテーマより優先される。
		expect(ui.progressBar(50, 100, { width: 2 })).toBe("▰▱");

		await client.destroy();
	});

	test("ui: false なら登録されない", async () => {
		const client = new Client({
			intents: [],
			baseDirectory: null,
			logger: { level: "silent" },
			plugins: [utils({ ui: false })],
		});
		await client.load();
		expect(client.stores.get("services").get("ui")).toBeUndefined();
		await client.destroy();
	});
});

describe("素の関数の既定値", () => {
	test("テーマの既定と一致する", () => {
		expect(progressBar(50, 100)).toHaveLength(defaultTheme.progress.width);
		expect(progressBar(100, 100).at(0)).toBe(defaultTheme.progress.filled);
		expect(progressBar(0, 100).at(0)).toBe(defaultTheme.progress.empty);
		expect(truncate("abcdef", 4).endsWith(defaultTheme.text.ellipsis)).toBe(true);
		expect(humanizeDuration(3_723_000)).toBe("1h 2m");
	});

	test("引数でその場だけ変えられる", () => {
		expect(progressBar(50, 100, { width: 2, filled: "#", empty: "." })).toBe("#.");
		expect(truncate("abcdef", 4, "~")).toBe("abc~");
		expect(humanizeDuration(3_723_000, { units: { h: "時間", m: "分" }, separator: "" })).toBe(
			"1時間2分",
		);
	});
});

describe("paginationRow の見た目", () => {
	test("テーマのラベル・色を使う", () => {
		const row = jsonOf(paginationRow(2, 5, "x"));
		expect(row.components.map((c) => c.label)).toEqual(["《", "‹", "2 / 5", "›", "》"]);
		expect(row.components[1]?.style).toBe(defaultTheme.pagination.prev.style);
	});

	test("テーマで丸ごと差し替えられる", () => {
		const row = jsonOf(
			paginationRow(2, 5, "x", {
				theme: {
					pagination: {
						first: { label: "最初", style: ButtonStyle.Danger },
						prev: { label: "前" },
						next: { label: "次" },
						last: { label: "最後" },
						counter: (c, t) => `${c}ページ目(全${t})`,
					},
				},
			}),
		);
		expect(row.components.map((c) => c.label)).toEqual([
			"最初",
			"前",
			"2ページ目(全5)",
			"次",
			"最後",
		]);
		expect(row.components[0]?.style).toBe(ButtonStyle.Danger);
	});

	test("target を渡すとクライアントのテーマが効く", async () => {
		const client = createClient({ pagination: { next: { label: "NEXT!" } } });
		await client.load();

		// target 無しでは既定のまま(どのクライアントの呼び出しか分からないため)。
		expect(jsonOf(paginationRow(1, 3, "x")).components[3]?.label).toBe("›");
		// target を渡せばそのクライアントのテーマから取る。
		const target = { client } as unknown as ReplyTarget;
		expect(jsonOf(paginationRow(1, 3, "x", { target })).components[3]?.label).toBe("NEXT!");

		await client.destroy();
	});

	test("showCounter をテーマで既定にできる", () => {
		const row = jsonOf(paginationRow(1, 3, "x", { theme: { pagination: { showCounter: false } } }));
		expect(row.components).toHaveLength(4);
		// 呼び出し側の指定はテーマより優先される。
		const back = jsonOf(
			paginationRow(1, 3, "x", {
				theme: { pagination: { showCounter: false } },
				showCounter: true,
			}),
		);
		expect(back.components).toHaveLength(5);
	});

	test("ラベルを消して絵文字だけのボタンにできる", () => {
		const row = jsonOf(
			paginationRow(1, 3, "x", { buttons: { next: { label: undefined, emoji: "▶️" } } }),
		);
		expect(row.components[3]?.label).toBeUndefined();
		expect((row.components[3]?.emoji as { name?: string } | undefined)?.name).toBe("▶️");
	});

	test("呼び出し側の buttons はテーマより優先される", () => {
		const row = jsonOf(paginationRow(2, 5, "x", { buttons: { next: "つぎ" } }));
		expect(row.components[3]?.label).toBe("つぎ");
		expect(row.components[1]?.label).toBe("‹"); // 指定しなかったものは既定
	});

	test("現在位置ボタンを消せる", () => {
		const row = jsonOf(paginationRow(2, 5, "x", { showCounter: false }));
		expect(row.components).toHaveLength(4);
		expect(row.components.map((c) => c.custom_id)).toEqual([
			"x:first",
			"x:prev",
			"x:next",
			"x:last",
		]);
	});
});

describe("confirm の見た目", () => {
	function fakeTarget(client?: Client) {
		const sent: BaseMessageOptions[] = [];
		const message = {
			awaitMessageComponent: async () => {
				throw new Error("time");
			},
		} as unknown as Message;
		const target = {
			deferred: false,
			replied: false,
			user: { id: "invoker" },
			client,
			reply: async (payload: BaseMessageOptions) => {
				sent.push(payload);
			},
			fetchReply: async () => message,
			editReply: async () => message,
		} as unknown as RepliableInteraction;
		return { target, sent };
	}

	const labelsOf = (payload: BaseMessageOptions) =>
		jsonOf(payload.components?.[0] as ActionRowBuilder<ButtonBuilder>).components.map(
			(c) => c.label,
		);

	test("既定はテーマのラベルと色", async () => {
		const { target, sent } = fakeTarget();
		await confirm(target);
		expect(labelsOf(sent[0] as BaseMessageOptions)).toEqual(["決定", "中止"]);
		expect(
			jsonOf((sent[0] as BaseMessageOptions).components?.[0] as ActionRowBuilder<ButtonBuilder>)
				.components[0]?.style,
		).toBe(defaultTheme.confirm.yes.style);
	});

	test("クライアントのテーマが効く", async () => {
		const client = createClient({
			confirm: { yes: { label: "はい", style: ButtonStyle.Primary }, no: { label: "いいえ" } },
		});
		await client.load();

		const { target, sent } = fakeTarget(client);
		await confirm(target);
		expect(labelsOf(sent[0] as BaseMessageOptions)).toEqual(["はい", "いいえ"]);

		await client.destroy();
	});

	test("呼び出し側の指定がテーマより優先される", async () => {
		const client = createClient({ confirm: { yes: { label: "はい" } } });
		await client.load();

		const { target, sent } = fakeTarget(client);
		await confirm(target, { yes: "実行する", no: { label: "やめる", emoji: "🚫" } });
		expect(labelsOf(sent[0] as BaseMessageOptions)).toEqual(["実行する", "やめる"]);

		await client.destroy();
	});

	test("呼び出しごとの theme はクライアントのテーマを消さない", async () => {
		const client = createClient({
			confirm: { yes: { label: "はい" }, no: { label: "いいえ" } },
		});
		await client.load();

		const { target, sent } = fakeTarget(client);
		// yes だけをその場で上書きしても、no はクライアントのテーマのまま。
		await confirm(target, { theme: { confirm: { yes: { label: "実行" } } } });
		expect(labelsOf(sent[0] as BaseMessageOptions)).toEqual(["実行", "いいえ"]);

		await client.destroy();
	});
});
