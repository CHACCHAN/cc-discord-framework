import clsx from "clsx";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import CodeWindow from "../CodeWindow";
import SectionHeader from "../SectionHeader";
import styles from "./styles.module.css";

type Sample = {
	id: string;
	label: string;
	filename: string;
	badge?: string;
	title: string;
	description: ReactNode;
	points: ReactNode[];
	code: string;
};

/** すべて client/ ディレクトリ(公式リファレンス Bot)の実コードです。 */
const SAMPLES: Sample[] = [
	{
		id: "command",
		label: "コマンド",
		filename: "src/commands/ai/AskCommand.ts",
		title: "コマンド本体は、1呼び出し。",
		description: (
			<>
				オプションはデコレータで宣言し、本体は{" "}
				<code>this.services.ai.reply()</code> の1行。defer・ストリーミング表示・
				長文の分割・失敗時の表示は、すべてサービス側の責務です。
			</>
		),
		points: [
			<>
				コマンド名はクラス名から自動導出(<code>AskCommand</code> → <code>/ask</code>)
			</>,
			<>Discord への登録・同期も ready 時に自動</>,
		],
		code: `import {
  ApplicationCommandOptionType,
  Command,
  type ChatInputCommandInteraction,
} from "cc-discord-framework";

@Command.define({
  description: "AIに質問します(会話履歴は使いません)。",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "prompt",
      description: "聞きたいこと",
      required: true,
    },
  ],
})
export class AskCommand extends Command {
  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    // defer・ストリーミング表示・長文の分割・失敗時の表示は reply() の担当。
    await this.services.ai.reply(interaction, {
      prompt: interaction.options.getString("prompt", true),
    });
  }
}`,
	},
	{
		id: "services",
		label: "サービス",
		filename: "src/commands/system/HelpCommand.ts",
		title: "import が、どこにも出てこない。",
		description: (
			<>
				コマンドストアを走査して一覧を作り、<code>this.services.ui</code> の
				テーマ済み埋め込みと <code>paginate()</code> でページ送りに。
				他のコンポーネントを import する行は1本もありません。
			</>
		),
		points: [
			<>
				<code>this.container.stores</code> — 全コンポーネントへ型付きでアクセス
			</>,
			<>コマンドを増やしても、このファイルは変更不要</>,
		],
		code: `import { chunk, paginate, type Page } from "@cc-discord-framework/utils";
import { Command, type ChatInputCommandInteraction } from "cc-discord-framework";

const PAGE_SIZE = 20;

@Command.define({ description: "コマンド一覧を表示します。" })
export class HelpCommand extends Command {
  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    const lines = this.container.stores
      .get("commands")
      .map((command) => \`**/\${command.name}** — \${command.description}\`)
      .sort();

    const pages: Page[] = chunk(lines, PAGE_SIZE).map((body, page, all) =>
      // utils プラグインの this.services.ui — 色は Bot 全体のテーマから。
      this.services.ui
        .info(body.join("\\n"))
        .setTitle("コマンド一覧")
        .setFooter({ text: \`\${page + 1}/\${all.length}ページ・全\${lines.length}コマンド\` }),
    );

    await paginate(interaction, { pages, ephemeral: true });
  }
}`,
	},
	{
		id: "task",
		label: "タスク",
		filename: "src/tasks/PresenceTask.ts",
		badge: "utils プラグイン",
		title: "プラグインが足した「種別」も、同じ書き味。",
		description: (
			<>
				<code>tasks/</code> は utils プラグインが追加するコンポーネント種別。
				コアの <code>commands/</code> と同じように、置くだけで定期実行が始まります。
			</>
		),
		points: [
			<>
				<code>every: &quot;5m&quot;</code> — 実行間隔も宣言的に
			</>,
			<>起動直後にも走らせるなら <code>runOnStart: true</code></>,
		],
		code: `import { ActivityType } from "cc-discord-framework";
import { Task } from "@cc-discord-framework/utils";

/** 公式 utils プラグインが追加する Task 種別のコンポーネント。 */
@Task.define({ every: "5m", runOnStart: true })
export class PresenceTask extends Task {
  override run() {
    this.client.user?.setPresence({
      activities: [{ type: ActivityType.Playing, name: "/help" }],
    });
  }
}`,
	},
	{
		id: "config",
		label: "設定",
		filename: "src/config/music.ts",
		title: "intent は、それを使う機能の隣に。",
		description: (
			<>
				<code>intents</code> は設定ファイル間で合併(union)されるので、音楽にしか
				要らない <code>GuildVoiceStates</code> は music の設定に置けます。
				音楽をやめるときはこのファイルを消すだけ — 要らなくなった intent も一緒に消えます。
			</>
		),
		points: [
			<>
				<code>plugins</code> は priority 順に連結 — 依存の向きで順序を制御
			</>,
			<>
				1関心1ファイル — <code>createClient()</code> が <code>config/</code> を合成
			</>,
		],
		code: `import { defineConfig, GatewayIntentBits } from "cc-discord-framework";
import { music } from "@cc-discord-framework/music";
import { musicSources } from "@cc-discord-framework/music-sources";
import { env } from "./_env.js";

export default defineConfig({
  priority: 50,
  intents: [
    // 音楽再生に必要(ボイスチャンネルの出入りを追うため)。
    GatewayIntentBits.GuildVoiceStates,
  ],
  plugins: [
    // キュー・再生制御の this.services.audio(/play などは src/commands/)。
    music(),
    // YouTube と SoundCloud を音源として追加(music より後に置く)。
    musicSources({
      soundcloud: { clientId: env.soundcloudClientId },
    }),
  ],
});`,
	},
	{
		id: "ai-tool",
		label: "AI ツール",
		filename: "src/ai/NowPlayingTool.ts",
		badge: "ai プラグイン",
		title: "クラスを置くと、LLM から呼べる関数になる。",
		description: (
			<>
				<code>src/ai/</code> に置いたクラスは、モデルが呼び出せるツールになります。
				中では <code>this.services.audio</code>(music プラグイン)がそのまま使える —
				プラグイン横断の合成です。<code>/chat</code> で「いま何の曲?」と聞くと、
				モデルがこのツールを呼びます。
			</>
		),
		points: [
			<>入力スキーマは zod で宣言 — 型もバリデーションも1箇所</>,
			<>
				<code>guildOnly: true</code> で DM からの呼び出しを制限
			</>,
		],
		code: `import { AiTool, type AiToolContext } from "@cc-discord-framework/ai";
import { z } from "zod";

const input = z.object({
  キュー: z.boolean().optional().describe("待機中の曲を題名の一覧で返すかどうか"),
});

@AiTool.define({
  description:
    "このサーバーで再生中の曲と、待機中の曲の状況を返します。音楽の再生状況を聞かれたら使ってください。",
  inputSchema: input,
  // 再生キューはサーバー単位なので、DM からの呼び出しでは使わせない。
  guildOnly: true,
})
export class NowPlayingTool extends AiTool<z.infer<typeof input>> {
  override execute({ キュー = false }: z.infer<typeof input>, context: AiToolContext) {
    const queue = context.guildId === null ? null : this.services.audio.queue(context.guildId);
    if (!queue?.current) return { 再生中: null, 待機中: 0 };

    return {
      再生中: { 題名: queue.current.title, 演者: queue.current.author },
      待機中: キュー ? queue.tracks.map((track) => track.title) : queue.tracks.length,
    };
  }
}`,
	},
];

export default function CodeShowcase(): ReactNode {
	const [activeId, setActiveId] = useState(SAMPLES[0]!.id);
	const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
	const active = SAMPLES.find((sample) => sample.id === activeId) ?? SAMPLES[0]!;
	const selectTab = (index: number): void => {
		const sample = SAMPLES[index];
		if (!sample) return;
		setActiveId(sample.id);
		tabRefs.current[index]?.focus();
	};
	const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
		let nextIndex: number | undefined;
		switch (event.key) {
			case "ArrowRight":
				nextIndex = (index + 1) % SAMPLES.length;
				break;
			case "ArrowLeft":
				nextIndex = (index - 1 + SAMPLES.length) % SAMPLES.length;
				break;
			case "Home":
				nextIndex = 0;
				break;
			case "End":
				nextIndex = SAMPLES.length - 1;
				break;
			default:
				return;
		}
		event.preventDefault();
		selectTab(nextIndex);
	};

	return (
		<section className={styles.section} data-landing-section>
			<div className="container">
				<SectionHeader
					eyebrow="04 — コード"
					title="実際の Bot から、そのまま。"
					lead="以下はすべて、リポジトリ同梱の公式リファレンス Bot(client/)で実際に動いているコードです。"
				/>
				{/* タブバーはすりガラスのピル。選択操作(role・キーボード)は変更しない。 */}
				<div className={clsx("lp-glass", styles.tabs)} role="tablist" aria-label="コード例">
					{SAMPLES.map((sample, index) => (
						<button
							key={sample.id}
							ref={(element) => {
								tabRefs.current[index] = element;
							}}
							type="button"
							role="tab"
							id={`showcase-tab-${sample.id}`}
							aria-selected={sample.id === active.id}
							aria-controls={`showcase-panel-${sample.id}`}
							tabIndex={sample.id === active.id ? 0 : -1}
							className={clsx(styles.tab, sample.id === active.id && styles.tabActive)}
							onClick={() => setActiveId(sample.id)}
							onKeyDown={(event) => onTabKeyDown(event, index)}
						>
							{sample.label}
						</button>
					))}
				</div>
				{SAMPLES.map((sample) => (
					<div
						key={sample.id}
						className={clsx("lp-frame", "lp-anchors", styles.panel)}
						role="tabpanel"
						id={`showcase-panel-${sample.id}`}
						aria-labelledby={`showcase-tab-${sample.id}`}
						hidden={sample.id !== active.id}
						tabIndex={sample.id === active.id ? 0 : -1}
					>
						<div className={styles.explain}>
							<h3 className={styles.panelTitle}>{sample.title}</h3>
							<p className={styles.panelBody}>{sample.description}</p>
							<ul className={styles.points}>
								{sample.points.map((point, index) => (
									// eslint-disable-next-line react/no-array-index-key
									<li key={index}>{point}</li>
								))}
							</ul>
						</div>
						<div className={styles.code}>
							{/* コードウィンドウの背後に敷く環境光。装飾のみ(操作を遮らない)。 */}
							<div className={clsx("lp-glow", styles.codeGlow)} aria-hidden="true" />
							<div className={styles.codeInner}>
								<CodeWindow filename={sample.filename} badge={sample.badge}>
									{sample.code}
								</CodeWindow>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
