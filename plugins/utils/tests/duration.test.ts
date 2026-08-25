import { describe, expect, test } from "bun:test";
import { formatDuration, humanizeDuration, parseDuration } from "../src/index.js";

describe("parseDuration", () => {
	test("数値はミリ秒としてそのまま扱う", () => {
		expect(parseDuration(0)).toBe(0);
		expect(parseDuration(1_500)).toBe(1_500);
		expect(parseDuration(1_500.6)).toBe(1_501);
	});

	test("数字だけの文字列もミリ秒", () => {
		expect(parseDuration("2500")).toBe(2_500);
	});

	test("単位付きを解釈する", () => {
		expect(parseDuration("500ms")).toBe(500);
		expect(parseDuration("90s")).toBe(90_000);
		expect(parseDuration("5m")).toBe(300_000);
		expect(parseDuration("2h")).toBe(7_200_000);
		expect(parseDuration("1d")).toBe(86_400_000);
		expect(parseDuration("1w")).toBe(604_800_000);
	});

	test("複合表記と空白・大文字", () => {
		expect(parseDuration("1h30m")).toBe(5_400_000);
		expect(parseDuration("1d 12h")).toBe(129_600_000);
		expect(parseDuration(" 1H 30M ")).toBe(5_400_000);
		expect(parseDuration("1.5h")).toBe(5_400_000);
	});

	test("m と ms を取り違えない", () => {
		expect(parseDuration("1m")).toBe(60_000);
		expect(parseDuration("1ms")).toBe(1);
		expect(parseDuration("1m1ms")).toBe(60_001);
	});

	test("不正な入力は TypeError", () => {
		expect(() => parseDuration("")).toThrow(TypeError);
		expect(() => parseDuration("すぐ")).toThrow(TypeError);
		expect(() => parseDuration("10y")).toThrow(TypeError);
		expect(() => parseDuration("1h30")).toThrow(TypeError);
		expect(() => parseDuration(-1)).toThrow(TypeError);
		expect(() => parseDuration(Number.NaN)).toThrow(TypeError);
	});
});

describe("formatDuration", () => {
	test("1時間未満は m:ss", () => {
		expect(formatDuration(0)).toBe("0:00");
		expect(formatDuration(9_000)).toBe("0:09");
		expect(formatDuration(83_000)).toBe("1:23");
		expect(formatDuration(3_599_000)).toBe("59:59");
	});

	test("1時間以上は h:mm:ss", () => {
		expect(formatDuration(3_600_000)).toBe("1:00:00");
		expect(formatDuration(3_723_000)).toBe("1:02:03");
	});

	test("負の値は 0 に丸める", () => {
		expect(formatDuration(-5_000)).toBe("0:00");
	});
});

describe("humanizeDuration", () => {
	test("既定は上位2単位", () => {
		expect(humanizeDuration(3_723_000)).toBe("1h 2m");
		expect(humanizeDuration(45_000)).toBe("45s");
		expect(humanizeDuration(90_061_000)).toBe("1d 1h");
	});

	test("max で単位数を増やせる", () => {
		expect(humanizeDuration(3_723_000, { max: 3 })).toBe("1h 2m 3s");
		expect(humanizeDuration(3_723_000, { max: 1 })).toBe("1h");
	});

	test("1秒未満とゼロ", () => {
		expect(humanizeDuration(250)).toBe("250ms");
		expect(humanizeDuration(0)).toBe("0s");
	});

	test("間の 0 の単位は飛ばす", () => {
		expect(humanizeDuration(86_401_000, { max: 2 })).toBe("1d 1s");
	});
});
