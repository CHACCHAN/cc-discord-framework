import { describe, expect, test } from "bun:test";
import {
	BOOT_HOLD_MS,
	BOOT_SCRIPT,
	bootDurationMs,
	loopedElapsedMs,
	visibleLineCount,
} from "./bootScript";

describe("BOOT_SCRIPT の構造", () => {
	test("時刻順に並んでいる(演出は前後しない)", () => {
		for (let i = 1; i < BOOT_SCRIPT.length; i += 1) {
			expect(BOOT_SCRIPT[i]!.at).toBeGreaterThanOrEqual(BOOT_SCRIPT[i - 1]!.at);
		}
	});

	test("最初の tree 行から始まり、最後は READY で終わる", () => {
		expect(BOOT_SCRIPT[0]?.pane).toBe("tree");
		expect(BOOT_SCRIPT.at(-1)?.kind).toBe("ready");
	});

	test("置いたファイルの数だけ登録行がある(コマンド応答の対話構造)", () => {
		const files = BOOT_SCRIPT.filter(
			(line) => line.kind === "file" && line.text !== "src/index.ts",
		);
		const registers = BOOT_SCRIPT.filter((line) => line.kind === "register");
		expect(registers.length).toBe(files.length);
	});
});

describe("visibleLineCount", () => {
	test("開始前は 0 行", () => {
		expect(visibleLineCount(BOOT_SCRIPT, -1)).toBe(0);
	});

	test("表示時刻ちょうどの行は表示済みに含む", () => {
		const second = BOOT_SCRIPT[1]!;
		expect(visibleLineCount(BOOT_SCRIPT, second.at)).toBe(2);
	});

	test("終端以降は全行", () => {
		expect(visibleLineCount(BOOT_SCRIPT, bootDurationMs(BOOT_SCRIPT))).toBe(
			BOOT_SCRIPT.length,
		);
	});
});

describe("loopedElapsedMs", () => {
	const duration = bootDurationMs(BOOT_SCRIPT);

	test("1 周目はそのままの経過時間", () => {
		expect(loopedElapsedMs(BOOT_SCRIPT, 1000, BOOT_HOLD_MS)).toBe(1000);
	});

	test("保持時間を過ぎると先頭へ戻る", () => {
		const cycle = duration + BOOT_HOLD_MS;
		expect(loopedElapsedMs(BOOT_SCRIPT, cycle, BOOT_HOLD_MS)).toBe(0);
		expect(loopedElapsedMs(BOOT_SCRIPT, cycle + 250, BOOT_HOLD_MS)).toBe(250);
	});

	test("負の経過時間は 0 に丸める", () => {
		expect(loopedElapsedMs(BOOT_SCRIPT, -500, BOOT_HOLD_MS)).toBe(0);
	});
});
