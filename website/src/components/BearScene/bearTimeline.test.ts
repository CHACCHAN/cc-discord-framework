import { describe, expect, test } from "bun:test";
import {
	DEFAULT_DWELL_PX,
	bearTargetsAt,
	sortWaypoints,
	type BearWaypoint,
} from "./bearTimeline";

const WPS: readonly BearWaypoint[] = [
	{ id: "hero", docY: 600, xFrac: 0.9, action: "hold" },
	{ id: "pillars", docY: 2000, xFrac: 0.1, action: "idle" },
	{ id: "code", docY: 5000, xFrac: 0.9, action: "sit" },
];

describe("sortWaypoints", () => {
	test("docY 昇順に並べ、元配列は変更しない", () => {
		const input = [WPS[2]!, WPS[0]!, WPS[1]!];
		const sorted = sortWaypoints(input);
		expect(sorted.map((w) => w.id)).toEqual(["hero", "pillars", "code"]);
		expect(input[0]!.id).toBe("code");
	});
});

describe("bearTargetsAt", () => {
	test("最初のウェイポイント以前は先頭に留まる", () => {
		const t = bearTargetsAt(0, WPS);
		expect(t.docY).toBe(600);
		expect(t.action).toBe("hold");
		expect(t.xFrac).toBe(0.9);
	});

	test("最後のウェイポイント以降は末尾に留まる", () => {
		const t = bearTargetsAt(99999, WPS);
		expect(t.docY).toBe(5000);
		expect(t.action).toBe("sit");
	});

	test("滞在半径内ではそのウェイポイントのアクションを披露する", () => {
		const t = bearTargetsAt(600 + DEFAULT_DWELL_PX - 1, WPS);
		expect(t.action).toBe("hold");
		expect(t.xFrac).toBe(0.9);
	});

	test("滞在圏外では次のウェイポイントへ歩く(左向き)", () => {
		const t = bearTargetsAt(1300, WPS);
		expect(t.action).toBe("walk");
		expect(t.facing).toBe(-1);
		expect(t.xFrac).toBeGreaterThan(0.1);
		expect(t.xFrac).toBeLessThan(0.9);
	});

	test("歩行中の x は進むほど目的地に近づく(単調性)", () => {
		const a = bearTargetsAt(1200, WPS);
		const b = bearTargetsAt(1600, WPS);
		expect(Math.abs(b.xFrac - 0.1)).toBeLessThan(Math.abs(a.xFrac - 0.1));
	});

	test("右向きの区間では facing が +1 になる", () => {
		const t = bearTargetsAt(3500, WPS);
		expect(t.action).toBe("walk");
		expect(t.facing).toBe(1);
	});

	test("短い区間では滞在半径が縮み、歩行区間が必ず残る", () => {
		const dense: BearWaypoint[] = [
			{ id: "a", docY: 0, xFrac: 0.2, action: "idle" },
			{ id: "b", docY: 300, xFrac: 0.8, action: "sit" },
		];
		const mid = bearTargetsAt(150, dense);
		expect(mid.action).toBe("walk");
	});

	test("ウェイポイントが空でも安全な既定値を返す", () => {
		const t = bearTargetsAt(1000, []);
		expect(t.action).toBe("idle");
		expect(t.xFrac).toBe(0.5);
	});

	test("滞在中は waypointId、歩行中は null を返す", () => {
		expect(bearTargetsAt(650, WPS).waypointId).toBe("hero");
		expect(bearTargetsAt(1300, WPS).waypointId).toBeNull();
	});

	test("dwellPx: 0 のウェイポイントは通過点になる(直前まで歩き続ける)", () => {
		const wps: BearWaypoint[] = [
			{ id: "a", docY: 0, xFrac: 0.2, action: "idle" },
			{ id: "pass", docY: 2000, xFrac: 0.8, action: "idle", dwellPx: 0 },
			{ id: "b", docY: 4000, xFrac: 0.2, action: "sit" },
		];
		// 既定の滞在半径なら滞在になる位置でも、dwellPx: 0 なら歩行のまま。
		const nearPass = bearTargetsAt(2000 - DEFAULT_DWELL_PX + 1, wps);
		expect(nearPass.action).toBe("walk");
		const afterPass = bearTargetsAt(2000 + DEFAULT_DWELL_PX - 1, wps);
		expect(afterPass.action).toBe("walk");
	});

	test("ウェイポイント個別の dwellPx が既定値より優先される", () => {
		const wps: BearWaypoint[] = [
			{ id: "a", docY: 0, xFrac: 0.2, action: "idle", dwellPx: 600 },
			{ id: "b", docY: 4000, xFrac: 0.8, action: "sit" },
		];
		expect(bearTargetsAt(500, wps).action).toBe("idle");
		expect(bearTargetsAt(700, wps).action).toBe("walk");
	});

	test("歩行中の restAnchorDocY は進んだ側の滞在圏の縁を指す", () => {
		// hero(600) → pillars(2000): 序盤(t<0.25)は戻り、後半は先へ。
		const early = bearTargetsAt(900, WPS);
		expect(early.action).toBe("walk");
		expect(early.restAnchorDocY).toBe(600 + DEFAULT_DWELL_PX);
		const late = bearTargetsAt(1600, WPS);
		expect(late.action).toBe("walk");
		expect(late.restAnchorDocY).toBe(2000 - DEFAULT_DWELL_PX);
	});

	test("滞在中の restAnchorDocY は現在のアンカーと一致する", () => {
		const t = bearTargetsAt(650, WPS);
		expect(t.restAnchorDocY).toBe(650);
	});

	test("滞在中の facing はウェイポイントの face を反映する", () => {
		const wps: BearWaypoint[] = [
			{ id: "a", docY: 0, xFrac: 0.2, action: "peer", face: 1 },
			{ id: "b", docY: 4000, xFrac: 0.8, action: "sit" },
		];
		expect(bearTargetsAt(100, wps).facing).toBe(1);
	});
});
