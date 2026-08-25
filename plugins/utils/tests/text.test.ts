import { describe, expect, test } from "bun:test";
import { chunk, progressBar, splitMessage, truncate } from "../src/index.js";

describe("truncate", () => {
	test("上限以下はそのまま", () => {
		expect(truncate("abc", 3)).toBe("abc");
		expect(truncate("", 10)).toBe("");
	});

	test("超えたら接尾辞込みで上限に収める", () => {
		expect(truncate("abcdef", 4)).toBe("abc…");
		expect(truncate("abcdef", 4).length).toBe(4);
		expect(truncate("abcdef", 5, "...")).toBe("ab...");
	});

	test("極端な上限", () => {
		expect(truncate("abcdef", 0)).toBe("");
		expect(truncate("abcdef", 1)).toBe("…");
		expect(truncate("abcdef", 2, "...")).toBe("..");
	});

	test("サロゲートペアの途中で切らない", () => {
		const text = "👍👍👍"; // 1文字あたり 2 code unit
		const result = truncate(text, 4);
		expect(result).toBe("👍…");
		expect([...result]).toHaveLength(2);
	});
});

describe("chunk", () => {
	test("均等に割れる場合と余る場合", () => {
		expect(chunk([1, 2, 3, 4], 2)).toEqual([
			[1, 2],
			[3, 4],
		]);
		expect(chunk([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
	});

	test("空配列は空", () => {
		expect(chunk([], 3)).toEqual([]);
	});

	test("不正なサイズは RangeError", () => {
		expect(() => chunk([1], 0)).toThrow(RangeError);
		expect(() => chunk([1], 1.5)).toThrow(RangeError);
	});
});

describe("splitMessage", () => {
	test("収まるならそのまま1つ", () => {
		expect(splitMessage("短い")).toEqual(["短い"]);
		expect(splitMessage("")).toEqual([]);
	});

	test("区切り文字の位置で分ける", () => {
		const parts = splitMessage("aaa\nbbb\nccc", { max: 8 });
		expect(parts).toEqual(["aaa\nbbb", "ccc"]);
	});

	test("すべて上限以下に収まる", () => {
		const text = Array.from({ length: 500 }, (_, index) => `行 ${index}`).join("\n");
		const parts = splitMessage(text);
		expect(parts.every((part) => part.length <= 2_000)).toBe(true);
		expect(parts.join("\n")).toBe(text);
	});

	test("単体で上限を超える塊は強制的に割る", () => {
		const parts = splitMessage("x".repeat(10), { max: 4 });
		expect(parts).toEqual(["xxxx", "xxxx", "xx"]);
	});

	test("強制分割でもサロゲートペアを切らない", () => {
		const text = `aa${"👍".repeat(4)}bb`;
		const parts = splitMessage(text, { max: 3 });

		expect(parts.join("")).toBe(text);
		expect(parts.every((part) => part.length <= 3)).toBe(true);
		expect(parts.every((part) => !/^[\uDC00-\uDFFF]|[\uD800-\uDBFF]$/.test(part))).toBe(true);
	});

	test("空の区切り指定でもサロゲートペアを切らない", () => {
		const text = `a${"🐻".repeat(3)}z`;
		const parts = splitMessage(text, { max: 3, separator: "" });

		expect(parts.join("")).toBe(text);
		expect(parts.every((part) => part.length <= 3)).toBe(true);
		expect(parts.every((part) => !/^[\uDC00-\uDFFF]|[\uD800-\uDBFF]$/.test(part))).toBe(true);
	});
});

describe("progressBar", () => {
	test("割合に応じて埋まる", () => {
		expect(progressBar(0, 100, { width: 10 })).toBe("░".repeat(10));
		expect(progressBar(50, 100, { width: 10 })).toBe("█████░░░░░");
		expect(progressBar(100, 100, { width: 10 })).toBe("█".repeat(10));
	});

	test("範囲外と 0 除算を丸める", () => {
		expect(progressBar(-5, 100, { width: 4 })).toBe("░░░░");
		expect(progressBar(500, 100, { width: 4 })).toBe("████");
		expect(progressBar(1, 0, { width: 4 })).toBe("░░░░");
	});

	test("幅は常に一定", () => {
		for (let value = 0; value <= 100; value += 7) {
			expect(progressBar(value, 100, { width: 20 })).toHaveLength(20);
		}
	});
});
