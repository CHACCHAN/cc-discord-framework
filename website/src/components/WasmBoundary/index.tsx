import useBaseUrl from "@docusaurus/useBaseUrl";
import { useRef, type ReactNode } from "react";
import TechIcon, { type TechIconId } from "../TechIcon";
import { useSignalLive } from "../signalLive";
import styles from "./styles.module.css";

const LANGUAGES: readonly { id: string; icon: TechIconId; label: string }[] = [
	{ id: "ts", icon: "typescript", label: "TypeScript" },
	{ id: "rust", icon: "rust", label: "Rust" },
	{ id: "go", icon: "go", label: "Go" },
	{ id: "cpp", icon: "cplusplus", label: "C/C++" },
];

/** WIT の設計スケッチ。構想段階であることをラベルで明示する。 */
const WIT_SKETCH = `package cc:plugin@0.1.0;

interface command {
  execute: func(input: string) -> result<string, string>;
}`;

/**
 * WebAssembly 対応の構想を示すセクション。
 * WASM を機能の1つとしてではなく「言語とランタイムの境界」として見せる —
 * 言語群が WIT の境界を通って1枚のコンポーネントに畳まれ、
 * ランタイムを経て Discord へ届く流れを、上から下への図として組む。
 * 図の配線上を小さな信号が周期的に流れ、接続が生きていることを示す
 * (画面外では停止し、reduced-motion では静的な図になる)。
 */
export default function WasmBoundary(): ReactNode {
	const diagramRef = useRef<HTMLElement | null>(null);
	// ベアがこのセクションへ到着した瞬間、信号の一巡を頭から流す。
	useSignalLive(diagramRef, "wasm");
	const logoUrl = useBaseUrl("img/logo.svg");

	return (
		<section className={styles.section}>
			<div className="container">
				<div className={styles.layout}>
					<div className={styles.copy}>
						<p className="lp-eyebrow lp-eyebrow-rule">07 · Roadmap — WebAssembly</p>
						<h2 className={`lp-display ${styles.title}`}>
							次の「1枚」は、
							<br />
							どの言語でも。
						</h2>
						<p className={styles.lead}>
							プラグインの次の形として、WebAssembly コンポーネントの
							ネイティブ対応を構想しています。境界を WIT で定義すれば、
							TypeScript 以外の言語で書いたプラグインも、いまと同じ
							「置くだけ」で動く — 言語の違いを、フレームワークの
							境界にしないための計画です。
						</p>
						<p className={styles.disclaimer}>
							設計構想の段階です。API と WIT 定義は未確定で、
							仕様は RFC として公開する予定です。
						</p>
					</div>

					<figure
						ref={diagramRef}
						className={styles.diagram}
						role="img"
						aria-label="TypeScript・Rust・Go・C/C++ の各言語が WIT のインターフェース定義を通って WebAssembly コンポーネントになり、フレームワークのランタイムが自動ロードして Discord へつながる流れの図"
					>
						{/* 言語の段: 境界の上に並ぶ出発点。 */}
						<ul className={styles.langs} aria-hidden="true">
							{LANGUAGES.map((lang) => (
								<li key={lang.id} className={styles.lang}>
									<TechIcon icon={lang.icon} className={styles.langIcon} />
									{lang.label}
								</li>
							))}
						</ul>
						{/* 言語から境界へ落ちる配線。信号が時間差で流れ込む。 */}
						<div className={styles.merge} aria-hidden="true">
							{LANGUAGES.map((lang, index) => (
								<span key={lang.id} className={styles.wire}>
									<i
										className={styles.signal}
										style={{ animationDelay: `${index * 0.14}s` }}
									/>
								</span>
							))}
						</div>

						{/* 境界の段: WIT。ここだけ面を持たせ、境界線であることを示す。 */}
						<div className={`${styles.boundary} ${styles.stopWit}`} aria-hidden="true">
							<p className={styles.boundaryLabel}>
								WIT — 境界のインターフェース定義
								<span className={styles.sketchTag}>設計スケッチ</span>
							</p>
							<pre className={styles.wit}>{WIT_SKETCH}</pre>
						</div>

						<div className={styles.drop} aria-hidden="true">
							<i className={styles.signal} style={{ animationDelay: "1.35s" }} />
						</div>

						{/* モジュールの段: ベアが抱えているのと同じ「1枚」。 */}
						<div className={`${styles.module} ${styles.stopModule}`} aria-hidden="true">
							<TechIcon icon="webassembly" className={styles.moduleIcon} />
							<span className={styles.moduleName}>plugin.wasm</span>
							<span className={styles.moduleNote}>1枚のコンポーネント</span>
						</div>

						<div className={styles.drop} aria-hidden="true">
							<i className={styles.signal} style={{ animationDelay: "2.6s" }} />
						</div>

						<div className={`${styles.runtime} ${styles.stopRuntime}`} aria-hidden="true">
							<img className={styles.runtimeMark} src={logoUrl} alt="" />
							<span className={styles.runtimeBody}>
								<span className={styles.runtimeName}>Framework Runtime</span>
								<span className={styles.runtimeNote}>
									自動ロード・型付け・this.services への接続
								</span>
							</span>
						</div>

						<div className={styles.drop} aria-hidden="true">
							<i className={styles.signal} style={{ animationDelay: "3.85s" }} />
						</div>

						<div className={`${styles.discord} ${styles.stopDiscord}`} aria-hidden="true">
							<TechIcon icon="discord" className={styles.discordIcon} />
							Discord
						</div>
					</figure>
				</div>
			</div>
		</section>
	);
}
