import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
	BOOT_HOLD_MS,
	BOOT_SCRIPT,
	loopedElapsedMs,
	visibleLineCount,
	type BootLine,
} from "./bootScript";
import styles from "./styles.module.css";

const INSTALL_COMMAND = "bun add @cc-discord-framework/core";

/** 演出の時間分解能(ミリ秒)。行の出現間隔より十分細かければよい。 */
const TICK_MS = 120;

/** log 行の先頭マーク。対話ログの読点として最小限に抑える。 */
function logMark(kind: BootLine["kind"]): string {
	switch (kind) {
		case "cmd":
			return "$";
		case "info":
			return "…";
		case "register":
			return "✔";
		case "ready":
			return "▲";
		default:
			return "";
	}
}

/**
 * ターミナル演出: tree ペインへファイルが置かれ、log ペインで
 * フレームワークが応答する。タイムラインは bootScript.ts の純粋データ。
 */
function BootTerminal(): ReactNode {
	// SSR / JS 無効時は完結した状態を見せる(隠れた内容を作らない)。
	const [visibleCount, setVisibleCount] = useState(BOOT_SCRIPT.length);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const startedAt = performance.now();
		// SSR は完成状態で描画されるため、再生開始をティック任せにせず即座に巻き戻す。
		setVisibleCount(visibleLineCount(BOOT_SCRIPT, 0));
		const timer = window.setInterval(() => {
			const elapsed = loopedElapsedMs(
				BOOT_SCRIPT,
				performance.now() - startedAt,
				BOOT_HOLD_MS,
			);
			const next = visibleLineCount(BOOT_SCRIPT, elapsed);
			setVisibleCount((current) => (current === next ? current : next));
		}, TICK_MS);

		return () => window.clearInterval(timer);
	}, []);

	const visible = BOOT_SCRIPT.slice(0, visibleCount);
	const treeLines = visible.filter((line) => line.pane === "tree");
	const logLines = visible.filter((line) => line.pane === "log");
	const ready = logLines.some((line) => line.kind === "ready");

	return (
		<figure
			className={styles.terminal}
			role="img"
			aria-label="ファイルを src/ に置くと、フレームワークが自動探索してコマンド・リスナー・サービスを登録し、READY になるまでのターミナル演出"
		>
			<figcaption className={styles.terminalChrome} aria-hidden="true">
				<span className={styles.terminalDots}>
					<i />
					<i />
					<i />
				</span>
				<span className={styles.terminalTitle}>bear-runtime — bun</span>
				<span
					className={clsx(styles.terminalStatus, ready && styles.terminalStatusReady)}
				>
					{ready ? "READY" : "BOOT"}
				</span>
			</figcaption>
			<div className={styles.terminalBody} aria-hidden="true">
				<div className={styles.treePane}>
					<p className={styles.paneLabel}>src/</p>
					<ul className={styles.treeList}>
						{treeLines.map((line) => (
							<li key={line.text} className={styles.treeLine}>
								<span className={styles.treeBranch}>├─</span>
								{line.text.replace(/^src\//, "")}
							</li>
						))}
					</ul>
				</div>
				<div className={styles.logPane}>
					<ul className={styles.logList}>
						{logLines.map((line) => (
							<li
								key={line.text}
								className={clsx(styles.logLine, styles[`log_${line.kind}`])}
							>
								<span className={styles.logMark}>{logMark(line.kind)}</span>
								<span className={styles.logText}>{line.text}</span>
								{line.note ? (
									<span className={styles.logNote}>{line.note}</span>
								) : null}
							</li>
						))}
						{!ready ? <li className={styles.caretLine} /> : null}
					</ul>
				</div>
			</div>
		</figure>
	);
}

/** インストールコマンドとコピー操作。クリップボードが無い環境では文言で伝える。 */
function InstallCommand(): ReactNode {
	const [feedback, setFeedback] = useState<string | null>(null);
	const resetTimer = useRef<number | null>(null);

	const copy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(INSTALL_COMMAND);
			setFeedback("コピーしました");
		} catch {
			setFeedback("コピーできませんでした");
		}
		if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
		resetTimer.current = window.setTimeout(() => setFeedback(null), 2000);
	}, []);

	useEffect(() => {
		return () => {
			if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
		};
	}, []);

	return (
		<div className={styles.install}>
			<code className={styles.installCommand}>
				<span aria-hidden="true">$</span> {INSTALL_COMMAND}
			</code>
			<button type="button" className={styles.copyButton} onClick={copy}>
				{feedback ?? "コピー"}
			</button>
		</div>
	);
}

/**
 * ヒーロー: 常時ダークの「深煎りステージ」。
 * data-bear-stage のレイヤー規約により、ベアは背景(data-bear-under)の前・
 * 本文(data-bear-over)の後ろを歩く。下端の floor はベアのために
 * 最初から確保してある舞台の床で、コンテンツは置かない。
 */
export default function Hero(): ReactNode {
	const bunLogoUrl = useBaseUrl("img/technologies/bun.svg");
	const discordJsLogoUrl = useBaseUrl("img/technologies/discordjs.svg");
	const typeScriptLogoUrl = useBaseUrl("img/technologies/typescript.svg");

	return (
		<section className={styles.hero} aria-labelledby="home-hero-title" data-bear-stage>
			{/* 背景装飾はベアの背面レイヤーへ。すべて操作を遮らない。 */}
			<div className={styles.stage} data-bear-under aria-hidden="true">
				<span className={styles.bgGrid} />
				<span className={styles.bgGlow} />
				<span className={styles.bgFloorLight} />
				<span className={styles.bgHorizon} />
			</div>

			<div className={styles.inner} data-bear-over>
				<header className={styles.copy}>
					<p className={styles.brandLine}>
						<Link className={styles.versionLink} to="/docs/framework/project-status">
							v2.0.0 — npm 公開中 <span aria-hidden="true">→</span>
						</Link>
					</p>
					<h1 id="home-hero-title" className={clsx("lp-display", styles.title)}>
						置くだけで、
						<br />
						<span className={styles.titleAccent}>動く。</span>
					</h1>
					<p className={styles.subtitle}>
						クラスを置く。フレームワークが見つけ、登録し、つなぐ。
						<br />
						Discord Bot の起動までを、規約と型に任せられます。
					</p>
					<div className={styles.actions}>
						<Link
							className={styles.primaryAction}
							to="/docs/framework/getting-started/installation"
						>
							いますぐ始める <span aria-hidden="true">→</span>
						</Link>
						<Link
							className={styles.secondaryAction}
							to="/docs/framework/introduction"
						>
							ドキュメントを読む
						</Link>
					</div>
					<InstallCommand />
					{/* ロゴは各プロジェクトからの借用のため、それぞれの公式リポジトリへ
					    リンクして出典を示す(static/img/technologies/ATTRIBUTIONS.md 参照)。 */}
					<ul className={styles.techList} aria-label="動作環境(各公式リポジトリへのリンク)">
						<li>
							<a
								href="https://github.com/oven-sh/bun"
								target="_blank"
								rel="noopener noreferrer"
							>
								<img src={bunLogoUrl} alt="" />
								<span>Bun 1.4+</span>
							</a>
						</li>
						<li>
							<a
								href="https://github.com/microsoft/TypeScript"
								target="_blank"
								rel="noopener noreferrer"
							>
								<img src={typeScriptLogoUrl} alt="" />
								<span>TypeScript</span>
							</a>
						</li>
						<li>
							<a
								href="https://github.com/discordjs/discord.js"
								target="_blank"
								rel="noopener noreferrer"
							>
								<img src={discordJsLogoUrl} alt="" data-technology="discordjs" />
								<span>discord.js 14</span>
							</a>
						</li>
					</ul>
				</header>

				<div className={styles.demo}>
					<BootTerminal />
					<p className={styles.demoCaption}>
						auto-discovery — 登録コードを書かずに、配置だけで Bot が組み上がる
					</p>
				</div>
			</div>

			{/* ベアの舞台床。ページを開くと、ベアが右手の奥からここへ歩いてくる。 */}
			<div
				className={styles.floor}
				data-bear-waypoint="hello"
				data-bear-id="hero"
				data-bear-x="0.52"
				data-bear-dy="0.8"
				data-bear-x-sm="0.5"
				data-bear-dy-sm="0.11"
				aria-hidden="true"
			/>
		</section>
	);
}
