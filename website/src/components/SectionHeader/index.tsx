import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./styles.module.css";

type Props = {
	/** 等幅の章ラベル(例: "01 · 設計思想")。 */
	eyebrow: string;
	/** 見出し。折返し位置は呼び出し側が <br> で設計する。 */
	title: ReactNode;
	lead?: ReactNode;
	/** 既定は左揃え。静かな結びのセクションだけ center を使う。 */
	align?: "left" | "center";
	/** 紙面(既定)か、常時ダークのステージ面か。 */
	tone?: "paper" | "stage";
};

/** 各セクション共通の見出しブロック。 */
export default function SectionHeader({
	eyebrow,
	title,
	lead,
	align = "left",
	tone = "paper",
}: Props): ReactNode {
	return (
		<header
			className={clsx(
				styles.header,
				align === "center" && styles.center,
				tone === "stage" && styles.stage,
			)}
		>
			<p className={clsx("lp-eyebrow", styles.eyebrow)}>{eyebrow}</p>
			<h2 className={clsx("lp-display", styles.title)}>{title}</h2>
			{lead ? <p className={styles.lead}>{lead}</p> : null}
		</header>
	);
}
