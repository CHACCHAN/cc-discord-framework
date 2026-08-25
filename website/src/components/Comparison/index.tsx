import clsx from "clsx";
import type { ReactNode } from "react";
import CodeWindow from "../CodeWindow";
import SectionHeader from "../SectionHeader";
import styles from "./styles.module.css";

/** 素の discord.js での現実的な書き方(公式 API のみを使用)。 */
const VANILLA = `import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";

// 1) コマンド定義を組み立てて…
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Botの応答速度を確認します。"),
  // コマンドを足すたびにここへ追記
];

// 2) REST API で自分で登録して…
const rest = new REST().setToken(process.env.DISCORD_TOKEN!);
await rest.put(Routes.applicationCommands(process.env.APP_ID!), {
  body: commands.map((c) => c.toJSON()),
});

// 3) ルーティングも自分で書く
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  switch (interaction.commandName) {
    case "ping":
      await interaction.reply(\`Pong! \${client.ws.ping}ms\`);
      break;
    // コマンドを足すたびに分岐も追記
  }
});

await client.login(process.env.DISCORD_TOKEN);`;

/** README と同じ最小エントリポイント(実コード)。 */
const FRAMEWORK_INDEX = `// src/index.ts — エントリポイントはこれだけ
import { Client, GatewayIntentBits } from "cc-discord-framework";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
await client.login(); // トークンは DISCORD_TOKEN 環境変数から自動使用`;

/** client/src/commands/system/PingCommand.ts と同一の実コード。 */
const FRAMEWORK_COMMAND = `// src/commands/PingCommand.ts — 置くだけ。登録・同期は自動
import { Command, type ChatInputCommandInteraction } from "cc-discord-framework";

@Command.define({ description: "Botの応答速度を確認します。" })
export class PingCommand extends Command {
  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.reply(\`Pong! \${this.client.ws.ping}ms\`);
  }
}`;

export default function Comparison(): ReactNode {
	return (
		<section className={styles.section} data-landing-section>
			<div className="container">
				<SectionHeader
					eyebrow="02 — discord.js との関係"
					title={
						<>
							discord.js を、<span className={styles.accent}>置き換えない。</span>
						</>
					}
					lead={
						<>
							cc-discord-framework は discord.js 14 の全 API を再エクスポートします
							(<code>export * from &quot;discord.js&quot;</code>)。
							柔軟性はそのままに、その上へ規約と型の構造を足す — 同じ discord.js でも、
							書く量はこれだけ変わります。
						</>
					}
				/>
				<div className={styles.grid}>
					{/* 素の discord.js 側: 彩度を落とした控えめな破線枠。 */}
					<div className={clsx("lp-frame", styles.column, styles.columnPlain)}>
						<p className={styles.columnLabel}>
							<span className={clsx("lp-badge", styles.labelPlain)}>discord.js のみ</span>
							定義・登録・ルーティングを手で配線
						</p>
						<CodeWindow filename="index.ts" badge="手動">
							{VANILLA}
						</CodeWindow>
					</div>
					{/* フレームワーク側: アクセント枠とアンカー点で主役を示す。 */}
					<div className={clsx("lp-frame", "lp-anchors", styles.column, styles.columnBrand)}>
						<p className={styles.columnLabel}>
							<span className={clsx("lp-badge", styles.labelBrand)}>cc-discord-framework</span>
							ファイルを置くことが、そのまま登録
						</p>
						<div className={styles.stack}>
							<CodeWindow filename="src/index.ts" badge="自動">
								{FRAMEWORK_INDEX}
							</CodeWindow>
							<CodeWindow filename="src/commands/PingCommand.ts" badge="自動">
								{FRAMEWORK_COMMAND}
							</CodeWindow>
						</div>
					</div>
				</div>
				<p className={clsx("lp-frame-t", styles.footnote)}>
					<code>interaction</code> は discord.js の型そのもの。2つ目のコマンドは
					ファイルをもう1枚置くだけで、左のコードのように登録行や分岐が増えることはありません。
				</p>
			</div>
		</section>
	);
}
