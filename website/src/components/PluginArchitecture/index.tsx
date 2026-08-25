import type { ReactNode } from "react";
import SectionHeader from "../SectionHeader";
import styles from "./styles.module.css";

type TreeRow = {
	depth: 0 | 1;
	name: string;
	note?: string;
	kind?: "core" | "utils" | "music" | "ai";
	last?: boolean;
};

const TREE: TreeRow[] = [
	{ depth: 0, name: "src/" },
	{ depth: 1, name: "index.ts", note: "エントリポイント(自動探索のルート)" },
	{ depth: 1, name: "config/", note: "設定 — 1関心1ファイル" },
	{ depth: 1, name: "commands/", note: "Command", kind: "core" },
	{ depth: 1, name: "listeners/", note: "Listener", kind: "core" },
	{ depth: 1, name: "preconditions/", note: "Precondition", kind: "core" },
	{ depth: 1, name: "services/", note: "Service", kind: "core" },
	{ depth: 1, name: "tasks/", note: "Task — 定期実行", kind: "utils" },
	{ depth: 1, name: "resolvers/ providers/", note: "音源の解決と再生", kind: "music" },
	{ depth: 1, name: "ai/", note: "AiTool — LLM から呼べる関数", kind: "ai", last: true },
];

const KIND_LABEL: Record<NonNullable<TreeRow["kind"]>, string> = {
	core: "コア",
	utils: "utils",
	music: "music",
	ai: "ai",
};

export default function PluginArchitecture(): ReactNode {
	return (
		<section className={styles.section}>
			<div className="container">
				<div className={styles.layout}>
					<div className={styles.copy}>
						<SectionHeader
							eyebrow="05 · プラグイン"
							title={
								<>
									機能ではなく、
									<br />
									「種別」を足す。
								</>
							}
						/>
						<p className={styles.paragraph}>
							プラグインが提供するのは、コンポーネント種別の自動ロード・サービス・
							イベントの3つだけ。<strong>コマンドは登録しません</strong> —{" "}
							<code>/play</code> も <code>/ask</code> も Bot の機能なので、
							<code>src/commands/</code> に自分で書きます。文言も見せ方も、Bot が決める。
						</p>
						<p className={styles.paragraph}>
							そして種別は横断して合成できます。<code>src/ai/</code> のツールの中で{" "}
							<code>this.services.audio</code> が普通に動く — 「いま流れている曲」を
							AI が答えられるのは、この合成のおかげです。
						</p>
						<p className={styles.paragraph}>
							独自のデコレータ・ディレクトリ・ライフサイクルを持つ新しい種別を、
							Public API だけで丸ごと追加できます。公式プラグインも、
							この同じ拡張点の上に立っています。
						</p>
					</div>
					<div className={styles.treeWrap}>
						{/* 図面の台紙: ヘアラインの枠と薄い方眼だけ。 */}
						<div className={styles.treeFrame}>
							<div
								className={styles.treeScroller}
								role="region"
								aria-label="src ディレクトリの構成。横方向にスクロールできます"
								aria-describedby="plugin-tree-caption"
								tabIndex={0}
							>
									<ul className={styles.tree}>
									{TREE.map((row) => (
										<li key={row.name} className={styles.row}>
											<span className={styles.branch} aria-hidden="true">
												{row.depth === 0 ? "" : row.last ? "└─" : "├─"}
											</span>
											<span className={styles.name}>{row.name}</span>
											{row.note ? <span className={styles.note}>{row.note}</span> : null}
											{row.kind ? (
												<span className={`${styles.badge} ${styles[`badge_${row.kind}`]}`}>
													{KIND_LABEL[row.kind]}
												</span>
											) : null}
										</li>
									))}
								</ul>
							</div>
						</div>
						<p id="plugin-tree-caption" className={styles.treeCaption}>
							置く場所が、そのまま役割。プラグインを入れると、読めるディレクトリが増える。
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
