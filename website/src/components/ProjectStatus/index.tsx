import Link from "@docusaurus/Link";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

const REPOSITORY = "https://github.com/CHACCHAN/cc-discord-framework";
const STATUS_UPDATED = "2026-08-25";

type StatusRow = {
	term: string;
	body: ReactNode;
	links: readonly { label: string; to?: string; href?: string }[];
};

const ROWS: StatusRow[] = [
	{
		term: "現行 — v2 系",
		body: (
			<>
				<code>@cc-discord-framework/core</code> 2.0.0。このサイトと main の
				コードが説明する現行版で、公式プラグインも同じスコープで npm 公開中。
			</>
		),
		links: [
			{ label: "導入手順", to: "/docs/framework/getting-started/installation" },
		],
	},
	{
		term: "旧 — v1 系",
		body: (
			<>
				スコープなしの旧パッケージ <code>cc-discord-framework</code>(1.0.5)は
				旧世代です。v2 と API 互換ではないため、新規導入では選ばないでください。
			</>
		),
		links: [
			{ label: "npm の v1", href: "https://www.npmjs.com/package/cc-discord-framework" },
			{ label: "v1.0.5 リリース", href: `${REPOSITORY}/releases/tag/v1.0.5` },
		],
	},
	{
		term: "保守",
		body: (
			<>
				CHACCHAN が設計・実装・ドキュメントを保守する個人メンテナンスの
				OSS(MIT License)。熊の耳にした2つの C は CHACCHAN から。
			</>
		),
		links: [
			{ label: "GitHub", href: "https://github.com/CHACCHAN" },
			{ label: "サポート方針", href: `${REPOSITORY}/blob/main/SUPPORT.md` },
			{ label: "Issues", href: `${REPOSITORY}/issues` },
		],
	},
];

/**
 * プロジェクトの現在地。v1 / v2 の取り違えを防ぐための情報を、
 * カードではなく定義リストの静かな帯として置く。
 */
export default function ProjectStatus(): ReactNode {
	return (
		<section
			id="project-status"
			className={styles.section}
			aria-labelledby="project-status-title"
		>
			<div className="container">
				<header className={styles.heading}>
					<p className="lp-eyebrow lp-eyebrow-rule">08 · Project Status — Updated {STATUS_UPDATED}</p>
					<h2 id="project-status-title" className={`lp-display ${styles.title}`}>
						プロジェクトの現在地
					</h2>
					<p className={styles.lead}>
						詳しい状況とサポート方針は
						<Link to="/docs/framework/project-status">ステータスページ</Link>
						にまとめています。
					</p>
				</header>
				<dl className={styles.rows}>
					{ROWS.map((row) => (
						<div key={row.term} className={styles.row}>
							<dt className={styles.term}>{row.term}</dt>
							<dd className={styles.detail}>
								<p className={styles.body}>{row.body}</p>
								<p className={styles.links}>
									{row.links.map((link) =>
										link.to ? (
											<Link key={link.label} to={link.to}>
												{link.label} →
											</Link>
										) : (
											<Link key={link.label} href={link.href}>
												{link.label} ↗
											</Link>
										),
									)}
								</p>
							</dd>
						</div>
					))}
				</dl>
			</div>
		</section>
	);
}
