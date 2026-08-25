import type { ReactNode } from "react";
import SectionHeader from "../SectionHeader";
import styles from "./styles.module.css";

type Feature = {
	number: string;
	title: string;
	body: ReactNode;
};

const FEATURES: Feature[] = [
	{
		number: "01",
		title: "標準デコレータ(TC39)",
		body: (
			<>
				<code>@Command.define({"{...}"})</code> は TC39 標準デコレータのみ。
				experimentalDecorators も reflect-metadata も不要です。
				デコレータは宣言し、ローダーが実行する — 厳密に分離されています。
			</>
		),
	},
	{
		number: "02",
		title: "設定は config/ に分割",
		body: (
			<>
				<code>createClient()</code> が <code>src/config/</code> を読み、1関心1ファイルの
				設定を合成。<code>plugins</code> は priority 順に連結、<code>intents</code> は
				合併(union)されます。
			</>
		),
	},
	{
		number: "03",
		title: "プラグインは「種別」を足す",
		body: (
			<>
				プラグインは機能ではなくコンポーネント種別ごと追加できます。utils は{" "}
				<code>tasks/</code>、music は <code>resolvers/</code>+<code>providers/</code>、
				ai は <code>ai/</code> — すべて Public API だけで実現。
			</>
		),
	},
	{
		number: "04",
		title: "すべて差し替え可能",
		body: (
			<>
				ユーザーに見える文言・色・上限は、すべてただの既定値。
				変更できないハードコードは設計ルールとして存在しません。
				Bot の見せ方は Bot が決めます。
			</>
		),
	},
	{
		number: "05",
		title: "Bun ファースト",
		body: (
			<>
				Bun 1.4+ 専用。TypeScript をそのまま実行するので、開発にビルド工程は
				ありません。500件を超える自動テストを <code>bun test</code> でまとめて実行できます。
			</>
		),
	},
	{
		number: "06",
		title: "型はマージで効く",
		body: (
			<>
				リスナーのイベント引数、ストア参照、<code>this.services.*</code>、
				Precondition 名 — 宣言マージにより、手動のジェネリクス指定なしで型が通ります。
			</>
		),
	},
];

/**
 * 主要機能の索引。仕様書の索引のように、ヘアラインで区切った升目に
 * 番号・見出し・本文だけを詰める、ページ内で最も密度の高いセクション。
 * 見出しの右側の余白はベアの立ち寄り先(座って索引を読む)。
 */
export default function FeatureGrid(): ReactNode {
	return (
		<section className={styles.section}>
			<div className="container">
				<SectionHeader
					eyebrow="03 · 主要機能"
					title={
						<>
							小さなコアと
							<br className="lp-br-sm" />
							本物の拡張点
						</>
					}
					lead="コアが持つのはサービス・コマンド・リスナー・Precondition だけ。それ以外は、同じ仕組みの上にプラグインとして積み上がります。"
				/>
				<div className={styles.grid}>
					{FEATURES.map((feature) => (
						<article key={feature.number} className={styles.cell}>
							<h3 className={styles.title}>{feature.title}</h3>
							<p className={styles.body}>{feature.body}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
