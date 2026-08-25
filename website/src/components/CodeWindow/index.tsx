import CodeBlock from "@theme/CodeBlock";
import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

type Props = {
	/** ウィンドウ上部に表示するファイル名(タブ風)。 */
	filename: string;
	/** 右端に出す小さなラベル(例: プラグイン名)。 */
	badge?: string;
	/** 紙面(既定)か、常時ダークのステージ面か。 */
	tone?: "paper" | "stage";
	language?: string;
	children: string;
};

/**
 * ファイル名タブ付きのコードウィンドウ。
 * ハイライト自体は Docusaurus の CodeBlock(prism)に任せます。
 */
export default function CodeWindow({
	filename,
	badge,
	tone = "paper",
	language = "typescript",
	children,
}: Props): ReactNode {
	return (
		<figure className={clsx(styles.window, tone === "stage" && styles.stage)}>
			<figcaption className={styles.chrome}>
				<span className={styles.filename}>{filename}</span>
				{badge ? <span className={styles.badge}>{badge}</span> : null}
			</figcaption>
			<div className={styles.body}>
				<CodeBlock language={language}>{children}</CodeBlock>
			</div>
		</figure>
	);
}
