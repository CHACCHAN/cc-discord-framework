import clsx from "clsx";
import type { ReactNode } from "react";
import SectionHeader from "../SectionHeader";
import styles from "./styles.module.css";

type Pillar = {
	icon: ReactNode;
	title: string;
	body: ReactNode;
};

const PILLARS: Pillar[] = [
	{
		icon: (
			// タイルを置くモチーフ
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
				<rect x="3" y="3" width="7.5" height="7.5" rx="2" />
				<rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
				<rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
				<rect x="13.5" y="3" width="7.5" height="7.5" rx="2" strokeDasharray="2.5 2.5" />
				<path d="M17.25 5.2v3.1M15.7 6.75h3.1" strokeLinecap="round" />
			</svg>
		),
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
		icon: (
			// 収束モチーフ
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
				<circle cx="12" cy="12" r="3.2" />
				<path d="M4 4l4.6 4.6M20 4l-4.6 4.6M4 20l4.6-4.6M20 20l-4.6-4.6" strokeLinecap="round" />
			</svg>
		),
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
		icon: (
			// レイヤーモチーフ(discord.js の上に載る)
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
				<path d="M12 3l9 5-9 5-9-5 9-5z" strokeLinejoin="round" />
				<path d="M3 13.5l9 5 9-5" strokeLinejoin="round" strokeLinecap="round" />
			</svg>
		),
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

export default function Pillars(): ReactNode {
	return (
		<section className={styles.section} data-landing-section>
			<div className="container">
				<SectionHeader
					eyebrow="01 — 設計思想"
					title="書くのは Bot の機能だけ。配線はフレームワークの仕事。"
					lead="発見・登録・ルーティング・型付け — Bot を書くたびに繰り返してきた「いつもの配線」を、規約と型で肩代わりします。"
				/>
				<div className={styles.gridWrap}>
					{/* カード群の背後に敷く環境光。装飾のみで操作は遮らない。 */}
					<span className={clsx("lp-glow", styles.glow)} aria-hidden="true" />
					<div className={styles.grid}>
						{PILLARS.map((pillar) => (
							<article
								key={pillar.title}
								className={clsx("lp-frame", "lp-anchors", "lp-lift", styles.card)}
							>
								<span className={styles.icon}>{pillar.icon}</span>
								<h3 className={styles.cardTitle}>{pillar.title}</h3>
								<p className={styles.cardBody}>{pillar.body}</p>
							</article>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
