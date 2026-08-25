/**
 * スクロール連動ベアのタイムラインです。
 * ページ上のウェイポイント(位置とアクション)と「ベアが居ようとする文書内Y」から、
 * 現在の目標状態(位置・向き・アクション)を純粋に導出します。
 * DOM 計測や three.js には依存しません。
 */

/** ベアが披露するアクションです。walk はウェイポイント間の移動中を表します。 */
export type BearActionId =
	| "hold"
	| "idle"
	| "sit"
	| "hello"
	| "bow"
	| "sleep"
	| "walk";

/** DOM 計測後のウェイポイント。docY は文書座標、xFrac はビューポート幅に対する割合。 */
export interface BearWaypoint {
	readonly id: string;
	readonly docY: number;
	readonly xFrac: number;
	readonly action: Exclude<BearActionId, "walk">;
}

/** ベアの目標状態。描画側はこれへ滑らかに追従する。 */
export interface BearTargets {
	readonly docY: number;
	readonly xFrac: number;
	readonly action: BearActionId;
	/** 進行方向。+1 で右向き、-1 で左向き。滞在中は直前の値を使う想定で 0 も許す。 */
	readonly facing: -1 | 0 | 1;
	/** 現在の区間内の正規化位置(0=区間開始、1=区間終了)。滞在中は 0。 */
	readonly segmentT: number;
}

/** ウェイポイント到着とみなす滞在半径(文書座標 px)の既定値。 */
export const DEFAULT_DWELL_PX = 220;

function smoothstep(t: number): number {
	const x = Math.min(1, Math.max(0, t));
	return x * x * (3 - 2 * x);
}

/** docY 昇順に整えたコピーを返します(呼び出し側の配列は変更しない)。 */
export function sortWaypoints(
	waypoints: readonly BearWaypoint[],
): BearWaypoint[] {
	return [...waypoints].sort((a, b) => a.docY - b.docY);
}

/**
 * アンカー(ベアが居ようとする文書内Y)から目標状態を導出します。
 * - 最初のウェイポイント以前・最後以降は端のウェイポイントに留まる
 * - ウェイポイントの滞在半径内ではそのアクションを披露する
 * - 滞在半径の外では次のウェイポイントへ歩く
 */
export function bearTargetsAt(
	anchorDocY: number,
	sorted: readonly BearWaypoint[],
	dwellPx: number = DEFAULT_DWELL_PX,
): BearTargets {
	if (sorted.length === 0) {
		return { docY: 0, xFrac: 0.5, action: "idle", facing: 0, segmentT: 0 };
	}

	const first = sorted[0]!;
	const last = sorted[sorted.length - 1]!;
	if (anchorDocY <= first.docY) {
		return { docY: first.docY, xFrac: first.xFrac, action: first.action, facing: 0, segmentT: 0 };
	}
	if (anchorDocY >= last.docY) {
		return { docY: last.docY, xFrac: last.xFrac, action: last.action, facing: 0, segmentT: 0 };
	}

	let from = first;
	let to = last;
	for (let i = 0; i < sorted.length - 1; i += 1) {
		if (anchorDocY >= sorted[i]!.docY && anchorDocY < sorted[i + 1]!.docY) {
			from = sorted[i]!;
			to = sorted[i + 1]!;
			break;
		}
	}

	// 滞在半径内はアクション披露。区間が短い場合は半径を区間の1/3に縮めて重複を防ぐ。
	const span = to.docY - from.docY;
	const dwell = Math.min(dwellPx, span / 3);
	if (anchorDocY - from.docY <= dwell) {
		return { docY: anchorDocY, xFrac: from.xFrac, action: from.action, facing: 0, segmentT: 0 };
	}
	if (to.docY - anchorDocY <= dwell) {
		return { docY: anchorDocY, xFrac: to.xFrac, action: to.action, facing: 0, segmentT: 1 };
	}

	// 滞在圏外: 次のウェイポイントへ歩く。x は滑らかに補間する。
	const t = (anchorDocY - from.docY - dwell) / (span - dwell * 2);
	const eased = smoothstep(t);
	const xFrac = from.xFrac + (to.xFrac - from.xFrac) * eased;
	const dx = to.xFrac - from.xFrac;
	const facing: -1 | 0 | 1 = dx > 0.001 ? 1 : dx < -0.001 ? -1 : 0;
	return { docY: anchorDocY, xFrac, action: "walk", facing, segmentT: t };
}
