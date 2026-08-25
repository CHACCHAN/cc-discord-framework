import Link from "@docusaurus/Link";
import type { ReactNode } from "react";
import CodeWindow from "../CodeWindow";
import SectionHeader from "../SectionHeader";
import styles from "./styles.module.css";

const STEPS: { title: string; body: ReactNode }[] = [
	{
		title: "インストール",
		body: (
			<>
				discord.js は同梱・再エクスポートされるので、個別にインストールする
				必要はありません。ランタイムは Bun 1.4+ だけ。
			</>
		),
	},
	{
		title: "エントリポイントを書く",
		body: (
			<>
				<code>src/index.ts</code> に <code>Client</code> を作って{" "}
				<code>login()</code>。トークンは <code>DISCORD_TOKEN</code>{" "}
				環境変数から自動で使われます。
			</>
		),
	},
	{
		title: "クラスを置く",
		body: (
			<>
				<code>src/commands/</code> にコマンドのクラスを1枚。ビルド工程なしで{" "}
				<code>bun run src/index.ts</code> — もう <code>/ping</code> が動いています。
			</>
		),
	},
];

export default function GettingStarted(): ReactNode {
	return (
		<section className={styles.section}>
			<div className="container">
				<SectionHeader
					eyebrow="09 · はじめる"
					title="まず、1枚置いてみる。"
					lead="最小の Bot まで3ステップ。ボイラープレートの生成も、ビルドの設定もありません。"
				/>
				<div className={styles.layout}>
					<ol className={styles.steps}>
						{STEPS.map((step, index) => (
							<li key={step.title} className={styles.step}>
								<span className={styles.stepNumber}>
									{String(index + 1).padStart(2, "0")}
								</span>
								<div>
									<h3 className={styles.stepTitle}>{step.title}</h3>
									<p className={styles.stepBody}>{step.body}</p>
								</div>
							</li>
						))}
					</ol>
					<div className={styles.code}>
						<CodeWindow filename="terminal" language="bash">
							{`bun add @cc-discord-framework/core
bun run src/index.ts`}
						</CodeWindow>
						<div className={styles.buttons}>
							<Link
								className={styles.buttonPrimary}
								to="/docs/framework/getting-started/installation"
							>
								インストールガイドへ
							</Link>
							<Link
								className={styles.repoLink}
								href="https://github.com/CHACCHAN/cc-discord-framework"
							>
								GitHub で見る ↗
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
