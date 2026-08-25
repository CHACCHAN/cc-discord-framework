import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

type Props = {
	/** モノスペースの小見出し(例: "01 — 設計思想")。 */
	eyebrow: string;
	title: ReactNode;
	lead?: ReactNode;
	align?: "left" | "center";
};

/** 各セクション共通の見出しブロック。 */
export default function SectionHeader({
	eyebrow,
	title,
	lead,
	align = "center",
}: Props): ReactNode {
	return (
		<header className={clsx(styles.header, align === "left" && styles.left)}>
			{/* 角括弧バッジ(グローバルの lp-badge)で章番号を示す。 */}
			<p className={clsx("lp-badge", styles.eyebrow)}>{eyebrow}</p>
			<h2 className={clsx("lp-display", styles.title)}>{title}</h2>
			{lead ? <p className={styles.lead}>{lead}</p> : null}
		</header>
	);
}
