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
	capabilities: readonly string[];
};

const PLUGINS: Plugin[] = [
	{
		name: "@cc-discord-framework/utils",
		slug: "utils",
		tagline: "毎回書くものの詰め合わせ",
		capabilities: ["tasks/", "confirm()", "paginate()", "this.services.ui"],
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
		capabilities: ["this.services.audio", "resolvers/", "providers/"],
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
		capabilities: ["YouTube", "SoundCloud", "yt-dlp", "ffmpeg"],
		body: (
			<>
				music プラグインに YouTube と SoundCloud を音源として追加。
				Bot 側の <code>/play</code> から検索語や URL を同じ Resolver へ渡せます。
				重い音源処理を本体から分離した独立パッケージです。
			</>
		),
	},
	{
		name: "@cc-discord-framework/ai",
		slug: "ai",
		tagline: "複数プロバイダー対応の AI",
		capabilities: ["this.services.ai", "ai/", "Streaming", "Structured Output"],
		body: (
			<>
				Vercel AI SDK ベース。<code>this.services.ai.reply()</code> が
				defer・ストリーミング・分割まで引き受け、<code>ai/</code> に置いた
				クラスはそのまま LLM のツールになります。
			</>
		),
	},
];

/**
 * 公式プラグインの台帳。カードを並べず、パッケージ名を左端に置いた
 * 行のリストとして組む。行全体がドキュメントへのリンク。
 */
export default function PluginCards(): ReactNode {
	const anthropicLogoUrl = useBaseUrl("img/technologies/anthropic.svg");
	const openAiLogoUrl = useBaseUrl("img/technologies/openai.svg");
	// Gemini のみ SVG を配布する Simple Icons の CDN から読み込む(公式形状・公式色)。
	const geminiLogoUrl = "https://cdn.simpleicons.org/googlegemini";
	return (
		<section className={styles.section}>
			<div className="container">
				<SectionHeader
					eyebrow="06 · 公式プラグイン"
					title={
						<>
							重い依存を
							<br className="lp-br-sm" />
							コアの外へ
						</>
					}
					lead="公式プラグインはそれぞれ独立したパッケージ。すべて npm の @cc-discord-framework スコープで公開されていて、使う分だけ bun add で足せます。"
				/>
				<ul className={styles.ledger}>
					{PLUGINS.map((plugin) => (
						<li key={plugin.name}>
							<Link to={`/docs/plugins/${plugin.slug}`} className={styles.row}>
								<div className={styles.ident}>
									<code className={styles.name}>{plugin.name}</code>
									<h3 className={styles.tagline}>
										{plugin.tagline}
										<span className={styles.arrow} aria-hidden="true">
											→
										</span>
									</h3>
								</div>
								<div className={styles.detail}>
									<p className={styles.body}>{plugin.body}</p>
									{plugin.slug === "ai" ? (
										<p
											className={styles.providers}
											aria-label="Vercel AI SDK から OpenAI、Google Gemini、Anthropic、OpenAI互換APIへ接続"
										>
											<span>Vercel AI SDK</span>
											<span className={styles.providersArrow} aria-hidden="true">
												→
											</span>
											<img src={openAiLogoUrl} alt="OpenAI" />
											<img src={geminiLogoUrl} alt="Google Gemini" />
											<img src={anthropicLogoUrl} alt="Anthropic" />
											<span>+ OpenAI 互換 API</span>
										</p>
									) : null}
									<p className={styles.capabilities}>
										{plugin.capabilities.join(" · ")}
									</p>
								</div>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
