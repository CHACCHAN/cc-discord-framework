import type { ReactNode } from "react";
import styles from "./styles.module.css";

/**
 * 結びの静かなメッセージ。大きな余白の中に一文だけを置く、
 * ページでいちばん情報密度の低いセクション。
 */
export default function JapanNote(): ReactNode {
	return (
		<section className={styles.section}>
			<div className="container">
				<div className={styles.inner}>
					<p className={`lp-eyebrow ${styles.eyebrow}`}>Built in Japan</p>
					<p className={`lp-display ${styles.message}`}>
						日本語で、最初から。
					</p>
					<p className={styles.body}>
						cc-discord-framework は日本発のオープンソースです。
						ドキュメントもコードコメントもエラーメッセージも、翻訳ではなく
						最初から日本語で書かれています。MIT License。
					</p>
				</div>
			</div>
		</section>
	);
}
