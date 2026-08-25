import type { ReactNode } from "react";
import styles from "./styles.module.css";

type Pillar = {
	number: string;
	title: string;
	body: ReactNode;
};

const PILLARS: Pillar[] = [
	{
		number: "01",
		title: "規約が構造になる",
		body: (
			<>
				<code>commands/</code> に置いたクラスが、そのままスラッシュコマンドになる。
				import も登録リストも書きません。名前はクラス名から導出
				(<code>UserInfoCommand</code> → <code>/user-info</code>)。
			</>
		),
	},
	{
		number: "02",
		title: "サービスは this に収束",
		body: (
			<>
				どのコンポーネントからも <code>this.services.audio</code> /{" "}
				<code>this.services.ai</code> / <code>this.services.ui</code>。
				宣言マージで型も通ります — 手動のジェネリクス指定はありません。
			</>
		),
	},
	{
		number: "03",
		title: "discord.js のまま",
		body: (
			<>
				<code>export * from &quot;discord.js&quot;</code> — 全 API を再エクスポートし、
				<code>Client</code> は discord.js の Client そのもの。
				これまでの知識も、エコシステムも、すべてそのまま使えます。
			</>
		),
	},
];

/**
 * 設計思想: 左に見出し、右に3項の縦積み。カードやアイコンは使わず、
 * 番号・見出し・本文とヘアラインだけで組む。左列の下の余白は
 * ベアの立ち寄り先(クラスのキューブを抱えて見せる)として確保してある。
 */
export default function Pillars(): ReactNode {
	return (
		<section className={styles.section}>
			<div className="container">
				<div className={styles.layout}>
					<header className={styles.copy}>
						<p className="lp-eyebrow lp-eyebrow-rule">01 · 設計思想</p>
						<h2 className={`lp-display ${styles.title}`}>
							書くのは、
							<br />
							Bot の機能だけ。
						</h2>
						<p className={styles.lead}>
							発見・登録・ルーティング・型付け。Bot を書くたびに
							繰り返してきた「いつもの配線」は、規約と型が肩代わりします。
						</p>
					</header>
					<ol className={styles.entries}>
						{PILLARS.map((pillar) => (
							<li key={pillar.number} className={styles.entry}>
								<span className={styles.number} aria-hidden="true">
									{pillar.number}
								</span>
								<div className={styles.entryBody}>
									<h3 className={styles.entryTitle}>{pillar.title}</h3>
									<p className={styles.entryText}>{pillar.body}</p>
								</div>
							</li>
						))}
					</ol>
				</div>
			</div>
		</section>
	);
}
