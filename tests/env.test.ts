import { describe, expect, test } from "bun:test";
import { ConfigLoadError, createEnv } from "../src/index.js";

describe("createEnv", () => {
	test("text は未設定・空文字・空白のみを null に寄せる", () => {
		const env = createEnv({ A: "value", B: "", C: "  ", D: "  padded  " });

		expect(env.text("A")).toBe("value");
		expect(env.text("B")).toBeNull();
		expect(env.text("C")).toBeNull();
		expect(env.text("D")).toBe("padded");
		expect(env.text("MISSING")).toBeNull();
	});

	test("required は未設定なら変数名を挙げて投げる", () => {
		const env = createEnv({ SET: "yes", EMPTY: "" });

		expect(env.required("SET")).toBe("yes");
		expect(() => env.required("EMPTY")).toThrow(ConfigLoadError);
		expect(() => env.required("MISSING")).toThrow("MISSING");
	});

	test("list はカンマ区切り・空白除去・空要素除去", () => {
		const env = createEnv({ IDS: " 1, 2 ,, 3 ", NONE: "" });

		expect(env.list("IDS")).toEqual(["1", "2", "3"]);
		expect(env.list("NONE")).toEqual([]);
		expect(env.list("MISSING")).toEqual([]);
	});

	test("list の区切り文字は差し替えられる", () => {
		const env = createEnv({ PATHS: "/a:/b" }, { listSeparator: ":" });

		expect(env.list("PATHS")).toEqual(["/a", "/b"]);
	});

	test("flag は on/true/1/yes と off/false/0/no を解釈する(大文字小文字無視)", () => {
		const env = createEnv({
			A: "on",
			B: "TRUE",
			C: "1",
			D: "off",
			E: "False",
			F: "0",
		});

		expect(env.flag("A", false)).toBe(true);
		expect(env.flag("B", false)).toBe(true);
		expect(env.flag("C", false)).toBe(true);
		expect(env.flag("D", true)).toBe(false);
		expect(env.flag("E", true)).toBe(false);
		expect(env.flag("F", true)).toBe(false);
		expect(env.flag("MISSING", true)).toBe(true);
		expect(env.flag("MISSING", false)).toBe(false);
		expect(env.warnings).toHaveLength(0);
	});

	test("解釈できない flag は既定値のまま warnings に積まれる", () => {
		const env = createEnv({ BROKEN: "offf" });

		expect(env.flag("BROKEN", true)).toBe(true);
		expect(env.warnings).toHaveLength(1);
		expect(env.warnings[0]).toContain("BROKEN");
		expect(env.warnings[0]).toContain("offf");
	});

	test("flag の語彙は差し替えられる", () => {
		const env = createEnv(
			{ A: "はい", B: "いいえ" },
			{ trueWords: ["はい"], falseWords: ["いいえ"] },
		);

		expect(env.flag("A", false)).toBe(true);
		expect(env.flag("B", true)).toBe(false);
	});

	test("number は数値を解釈し、できなければ既定値 + 警告", () => {
		const env = createEnv({ PORT: "8080", RATE: "1.5", BROKEN: "many" });

		expect(env.number("PORT", 0)).toBe(8080);
		expect(env.number("RATE", 0)).toBe(1.5);
		expect(env.number("MISSING", 42)).toBe(42);
		expect(env.number("BROKEN", 42)).toBe(42);
		expect(env.warnings).toHaveLength(1);
		expect(env.warnings[0]).toContain("BROKEN");
	});

	test("warnings はライブビュー(あとから読んだ分も見える)", () => {
		const env = createEnv({ A: "junk", B: "junk" });
		const seen = env.warnings;

		env.flag("A", true);
		expect(seen).toHaveLength(1);
		env.number("B", 0);
		expect(seen).toHaveLength(2);
	});

	test("インスタンスごとに独立している(モジュールレベルの状態がない)", () => {
		const first = createEnv({ A: "junk" });
		const second = createEnv({});

		first.flag("A", true);
		expect(first.warnings).toHaveLength(1);
		expect(second.warnings).toHaveLength(0);
	});
});
