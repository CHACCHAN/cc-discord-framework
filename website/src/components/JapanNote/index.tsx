import type { ReactNode } from "react";
import styles from "./styles.module.css";

export default function JapanNote(): ReactNode {
	return (
		<section className={styles.section} data-landing-section>
			<div className="container">
				<div className={styles.inner}>
					<p className={styles.eyebrow}>Built in Japan</p>
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
