import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import type { ReactNode } from "react";
import SectionHeader from "../SectionHeader";
import styles from "./styles.module.css";

type Plugin = {
	name: string;
	slug: "utils" | "music" | "music-sources" | "ai";
	tagline: string;
	body: ReactNode;
	accent: "utils" | "music" | "sources" | "ai";
	capabilities: readonly string[];
};

const PLUGINS: Plugin[] = [
	{
		name: "@cc-discord-framework/utils",
		slug: "utils",
		tagline: "毎回書くものの詰め合わせ",
		accent: "utils",
		capabilities: ["Tasks", "Confirm UI", "Pagination", "Format"],
		body: (
			<>
				テーマ済み埋め込みの <code>this.services.ui</code>、確認ダイアログの{" "}
				<code>confirm()</code>、ページ送りの <code>paginate()</code>、
				定期実行の <code>tasks/</code> 種別、時間・文字列の整形ユーティリティ。
			</>
		),
	},
	{
		name: "@cc-discord-framework/music",
		slug: "music",
		tagline: "キューと再生制御のエンジン",
		accent: "music",
		capabilities: ["Queue", "Voice", "Resolver", "Stream Provider"],
		body: (
			<>
				<code>this.services.audio</code> で解決・キュー・再生制御。
				コマンドは登録しない設計 — <code>/play</code> の文言も見せ方も
				Bot 側が決めます。音源はプロバイダー機構で差し替え可能。
			</>
		),
	},
	{
		name: "@cc-discord-framework/music-sources",
		slug: "music-sources",
		tagline: "YouTube と SoundCloud",
		accent: "sources",
		capabilities: ["YouTube", "SoundCloud", "yt-dlp", "ffmpeg"],
		body: (
			<>
				music プラグインに YouTube と SoundCloud を音源として追加。
				Bot 側の <code>/play</code> から検索語や URL を同じ Resolver へ渡せます。
				<code>yt-dlp</code> と <code>ffmpeg</code> を使う音源処理を、
				本体から分離した独立パッケージです。
			</>
		),
	},
	{
		name: "@cc-discord-framework/ai",
		slug: "ai",
		tagline: "複数プロバイダー対応の AI",
		accent: "ai",
		capabilities: ["Streaming", "Memory", "Structured Output", "Tools"],
		body: (
			<>
				Vercel AI SDK ベース。<code>this.services.ai.reply()</code> が
				defer・ストリーミング・分割まで引き受け、<code>ai/</code> に置いた
				クラスはそのまま LLM のツールになります。
			</>
		),
	},
];

export default function PluginCards(): ReactNode {
	const aiSdkLogoUrl = useBaseUrl("img/technologies/ai-sdk.svg");
	const anthropicLogoUrl = useBaseUrl("img/technologies/anthropic.svg");
	const openAiLogoUrl = useBaseUrl("img/technologies/openai.svg");
	// Gemini のみ SVG を配布する Simple Icons の CDN から読み込む(公式形状・公式色)。
	const geminiLogoUrl = "https://cdn.simpleicons.org/googlegemini";
	return (
		<section className={styles.section} data-landing-section>
			<div className="container">
				<SectionHeader
					eyebrow="06 — 公式プラグイン"
					title="重い依存は、コアに持ち込まない。"
					lead="公式プラグインはそれぞれ独立したパッケージ。v2 向けパッケージは現在 npm 公開前のため、詳細ページではモノレポから試す方法も案内しています。"
				/>
				<div className={styles.grid}>
					{PLUGINS.map((plugin) => (
						<Link key={plugin.name} to={`/docs/plugins/${plugin.slug}`} className={styles.card}>
							<span className={`${styles.stripe} ${styles[`stripe_${plugin.accent}`]}`} />
							<code className={styles.name}>{plugin.name}</code>
							<h3 className={styles.tagline}>{plugin.tagline}</h3>
							{plugin.slug === "ai" ? (
								<div
									className={styles.providerFlow}
									aria-label="Vercel AI SDK から OpenAI、Google Gemini、Anthropic、OpenAI互換APIへ接続"
								>
									<span className={styles.sdkMark}>
										<img src={aiSdkLogoUrl} alt="" />
										Vercel AI SDK
									</span>
									<span className={styles.flowArrow} aria-hidden="true">→</span>
									<span className={styles.providerMarks}>
										<img src={openAiLogoUrl} alt="OpenAI" />
										<img src={geminiLogoUrl} alt="Google Gemini" />
										<img src={anthropicLogoUrl} alt="Anthropic" />
										<small>Compatible</small>
									</span>
								</div>
							) : null}
							<ul className={styles.capabilities} aria-label={`${plugin.tagline} の主な機能`}>
								{plugin.capabilities.map((capability) => (
									<li key={capability}>{capability}</li>
								))}
							</ul>
							<p className={styles.body}>{plugin.body}</p>
							<span className={styles.more}>ドキュメントを見る →</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
