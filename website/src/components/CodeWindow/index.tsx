import CodeBlock from "@theme/CodeBlock";
import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

type Props = {
	/** ウィンドウ上部に表示するファイル名(タブ風)。 */
	filename: string;
	/** 右端に出す小さなラベル(例: プラグイン名)。 */
	badge?: string;
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
	language = "typescript",
	children,
}: Props): ReactNode {
	return (
		// lp-anchors で四隅(左上・右下)に設計図のアンカー点を付ける
		<figure className={clsx("lp-anchors", styles.window)}>
			{/* クロームバーはすりガラス(lp-glass)で浮かせる */}
			<figcaption className={clsx("lp-glass", styles.chrome)}>
				<span className={styles.dots} aria-hidden="true">
					<i />
					<i />
					<i />
				</span>
				<span className={styles.filename}>{filename}</span>
				{badge ? <span className={clsx("lp-badge", styles.badge)}>{badge}</span> : null}
			</figcaption>
			<div className={styles.body}>
				<CodeBlock language={language}>{children}</CodeBlock>
			</div>
		</figure>
	);
}
