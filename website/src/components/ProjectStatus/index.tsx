import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

const REPOSITORY = "https://github.com/CHACCHAN/cc-discord-framework";
const STATUS_UPDATED = "2026-08-24";

/** 現在のリリース状況・保守者・サポート先を一か所で判断できる情報パネルです。 */
export default function ProjectStatus(): ReactNode {
	const logoUrl = useBaseUrl("img/logo.svg");

	return (
		<section
			id="project-status"
			className={styles.section}
			data-landing-section
			aria-labelledby="project-status-title"
		>
			<div className="container">
				<div className={styles.shell}>
					<div className={styles.heading}>
						<p className={styles.eyebrow}>Project status / Updated {STATUS_UPDATED}</p>
						<h2 id="project-status-title" className={styles.title}>
							いま選ぶ版と、頼れる場所。
						</h2>
						<p className={styles.lead}>
							公開前の v2 と npm の v1 を混同しないための、現在地をまとめました。
							<br />
							<Link to="/docs/framework/project-status">詳しい状況とサポート方針 →</Link>
						</p>
					</div>

					<div className={styles.grid}>
						<article className={styles.versionCard}>
							<div className={styles.versionHeader}>
								<span className={styles.liveDot} aria-hidden="true" />
								<span>Docs target / unreleased preview</span>
							</div>
							<h3>v2 Next — 未公開</h3>
							<p>
								このサイトと main のコードが説明する未リリース版。v2 を試す場合は
								GitHub の main から導入します。
							</p>
							<code>bun add github:CHACCHAN/cc-discord-framework</code>
							<Link to="/docs/framework/getting-started/installation">導入手順を確認する →</Link>
						</article>

						<article className={styles.legacyCard}>
							<p className={styles.cardLabel}>npm latest / legacy · 2026-05-10</p>
							<h3>v1.0.5</h3>
							<p>
								npm の最新版は旧世代の 1.x です。v2 のドキュメントとは API
								互換ではないため、新規導入時は区別してください。
							</p>
							<Link href="https://www.npmjs.com/package/cc-discord-framework">
								npm の v1 を確認する ↗
							</Link>
							<span aria-hidden="true"> · </span>
							<Link href={`${REPOSITORY}/releases/tag/v1.0.5`}>
								v1.0.5 Release ↗
							</Link>
						</article>

						<article className={styles.maintainerCard}>
							<img src={logoUrl} alt="CC の耳を持つ熊。CC は CHACCHAN から" />
							<div>
								<p className={styles.cardLabel}>Maintained by</p>
								<h3>CHACCHAN</h3>
								<p>
									熊の耳にした2つの C は CHACCHAN から。CHACCHAN が設計・実装・
									ドキュメントを保守する個人メンテナンスの OSS です。公開コードと
									運用リファレンス Bot を基準に改善しています。
								</p>
								<Link href="https://github.com/CHACCHAN">GitHub プロフィール ↗</Link>
							</div>
						</article>

						<nav className={styles.supportCard} aria-label="プロジェクトのサポート導線">
							<p className={styles.cardLabel}>Follow &amp; support</p>
							<h3>変化と相談を追う。</h3>
							<ul>
								<li>
									<Link href={`${REPOSITORY}/blob/main/SUPPORT.md`}>Support policy ↗</Link>
									<span>質問・不具合と、脆弱性報告に関する案内</span>
								</li>
								<li>
									<Link href={`${REPOSITORY}/issues`}>Issues ↗</Link>
									<span>不具合の報告と既知の課題</span>
								</li>
								<li>
									<Link href={`${REPOSITORY}/commits/main`}>Activity ↗</Link>
									<span>main の更新履歴</span>
								</li>
								<li>
									<Link href={`${REPOSITORY}/blob/main/LICENSE`}>MIT License ↗</Link>
									<span>利用条件</span>
								</li>
								<li>
									<Link to="/docs/framework/getting-started/installation">
										v2 release policy →
									</Link>
									<span>公開前後の導入方針</span>
								</li>
							</ul>
						</nav>
					</div>
				</div>
			</div>
		</section>
	);
}
