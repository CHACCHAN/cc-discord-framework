/**
 * ヒーローのターミナル演出「置くだけで、動く。」のタイムラインです。
 * tree ペインにファイルが置かれ、log ペインでフレームワークが応答する
 * 一連の流れを、経過時間だけから導出できる純粋データとして持ちます。
 */

export type BootPane = "tree" | "log";

export type BootLineKind =
	/** tree ペインに現れるファイル行。 */
	| "file"
	/** log ペインの入力コマンド行。 */
	| "cmd"
	/** log ペインの進行メッセージ行。 */
	| "info"
	/** log ペインの登録完了行。 */
	| "register"
	/** log ペインの起動完了行。 */
	| "ready";

export interface BootLine {
	/** 演出開始からの表示時刻(ミリ秒)。 */
	readonly at: number;
	readonly pane: BootPane;
	readonly kind: BootLineKind;
	/** 行の主文。tree では相対パス、log では本文。 */
	readonly text: string;
	/** log 行の右側に添える補足(登録結果など)。 */
	readonly note?: string;
}

/**
 * 表示順 = 時刻順で並べたタイムライン本体です。
 * ファイル行の直後にフレームワークの応答が続く対話構造にしています。
 */
export const BOOT_SCRIPT: readonly BootLine[] = [
	{ at: 0, pane: "tree", kind: "file", text: "src/index.ts" },
	{ at: 300, pane: "log", kind: "cmd", text: "bun run src/index.ts" },
	{ at: 900, pane: "log", kind: "info", text: "auto-discover", note: "src/ を走査" },
	{ at: 1600, pane: "tree", kind: "file", text: "src/commands/PingCommand.ts" },
	{ at: 2200, pane: "log", kind: "register", text: "command", note: "/ping を登録" },
	{ at: 2900, pane: "tree", kind: "file", text: "src/listeners/ReadyListener.ts" },
	{ at: 3500, pane: "log", kind: "register", text: "listener", note: "ready へ自動配線" },
	{ at: 4200, pane: "tree", kind: "file", text: "src/services/GreetingService.ts" },
	{ at: 4800, pane: "log", kind: "register", text: "service", note: "this.services.greeting" },
	{ at: 5600, pane: "log", kind: "ready", text: "READY", note: "登録リストも import も、書いていない。" },
];

/** READY 表示後、先頭へループするまでの保持時間(ミリ秒)。 */
export const BOOT_HOLD_MS = 4400;

/** タイムライン全体の長さ(最後の行の表示時刻)を返します。 */
export function bootDurationMs(script: readonly BootLine[]): number {
	let max = 0;
	for (const line of script) {
		if (line.at > max) max = line.at;
	}
	return max;
}

/**
 * 経過時間の時点で表示されている行数を返します。
 * 負の経過時間は 0 行、タイムライン終端以降は全行です。
 */
export function visibleLineCount(
	script: readonly BootLine[],
	elapsedMs: number,
): number {
	let count = 0;
	for (const line of script) {
		if (line.at <= elapsedMs) count += 1;
	}
	return count;
}

/**
 * ループ再生での実効経過時間を返します。
 * 1 周は「タイムライン長 + 保持時間」で、周回後は先頭から数え直します。
 */
export function loopedElapsedMs(
	script: readonly BootLine[],
	elapsedMs: number,
	holdMs: number,
): number {
	const cycle = bootDurationMs(script) + holdMs;
	if (cycle <= 0) return 0;
	const clamped = Math.max(0, elapsedMs);
	return clamped % cycle;
}
