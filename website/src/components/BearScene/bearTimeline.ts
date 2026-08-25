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
	| "peer"
	| "sleep"
	| "walk";

/** DOM 計測後のウェイポイント。docY は文書座標、xFrac はビューポート幅に対する割合。 */
export interface BearWaypoint {
	readonly id: string;
	readonly docY: number;
	readonly xFrac: number;
	readonly action: Exclude<BearActionId, "walk">;
	/**
	 * 到着とみなす滞在半径(文書座標 px)。0 にすると滞在しない通過点になり、
	 * 歩行経路の中継点として使えます。未指定は DEFAULT_DWELL_PX。
	 */
	readonly dwellPx?: number;
	/** 滞在中の体の向き。+1 で右、-1 で左、0(既定)で正面。 */
	readonly face?: -1 | 0 | 1;
}

/** ベアの目標状態。描画側はこれへ滑らかに追従する。 */
export interface BearTargets {
	readonly docY: number;
	readonly xFrac: number;
	readonly action: BearActionId;
	/** 向き。歩行中は進行方向、滞在中はウェイポイントの face。 */
	readonly facing: -1 | 0 | 1;
	/** 現在の区間内の正規化位置(0=区間開始、1=区間終了)。滞在中は 0。 */
	readonly segmentT: number;
	/** 滞在中のウェイポイント id。歩行中は null。 */
	readonly waypointId: string | null;
	/**
	 * 歩き切りの目標アンカー。スクロールが止まったとき、ベアは道の途中で
	 * 固まらず、この値までアンカーを進めて最寄りの滞在圏に入る。
	 * 滞在中は現在のアンカーと同じ。
	 */
	readonly restAnchorDocY: number;
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

/** ウェイポイントの滞在半径を、区間長との兼ね合いで解決します。 */
function dwellOf(
	waypoint: BearWaypoint,
	span: number,
	fallback: number,
): number {
	const wanted = waypoint.dwellPx ?? fallback;
	// 区間が短い場合は半径を区間の1/3に縮め、隣の滞在圏と重ならないようにする。
	return Math.min(wanted, span / 3);
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
		return {
			docY: 0,
			xFrac: 0.5,
			action: "idle",
			facing: 0,
			segmentT: 0,
			waypointId: null,
			restAnchorDocY: anchorDocY,
		};
	}

	const first = sorted[0]!;
	const last = sorted[sorted.length - 1]!;
	if (anchorDocY <= first.docY) {
		return {
			docY: first.docY,
			xFrac: first.xFrac,
			action: first.action,
			facing: first.face ?? 0,
			segmentT: 0,
			waypointId: first.id,
			restAnchorDocY: anchorDocY,
		};
	}
	if (anchorDocY >= last.docY) {
		return {
			docY: last.docY,
			xFrac: last.xFrac,
			action: last.action,
			facing: last.face ?? 0,
			segmentT: 0,
			waypointId: last.id,
			restAnchorDocY: anchorDocY,
		};
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

	const span = to.docY - from.docY;
	const fromDwell = dwellOf(from, span, dwellPx);
	const toDwell = dwellOf(to, span, dwellPx);
	if (anchorDocY - from.docY <= fromDwell) {
		return {
			docY: anchorDocY,
			xFrac: from.xFrac,
			action: from.action,
			facing: from.face ?? 0,
			segmentT: 0,
			waypointId: from.id,
			restAnchorDocY: anchorDocY,
		};
	}
	if (to.docY - anchorDocY <= toDwell) {
		return {
			docY: anchorDocY,
			xFrac: to.xFrac,
			action: to.action,
			facing: to.face ?? 0,
			segmentT: 1,
			waypointId: to.id,
			restAnchorDocY: anchorDocY,
		};
	}

	// 滞在圏外: 次のウェイポイントへ歩く。x は滑らかに補間する。
	const t = (anchorDocY - from.docY - fromDwell) / (span - fromDwell - toDwell);
	const eased = smoothstep(t);
	const xFrac = from.xFrac + (to.xFrac - from.xFrac) * eased;
	const dx = to.xFrac - from.xFrac;
	const facing: -1 | 0 | 1 = dx > 0.001 ? 1 : dx < -0.001 ? -1 : 0;
	// 歩き切りの目標: 進んだ側の滞在圏の縁。序盤なら元の滞在圏へ戻る。
	const restAnchorDocY = t < 0.25 ? from.docY + fromDwell : to.docY - toDwell;
	return {
		docY: anchorDocY,
		xFrac,
		action: "walk",
		facing,
		segmentT: t,
		waypointId: null,
		restAnchorDocY,
	};
}
