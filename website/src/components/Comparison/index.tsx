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
import {
  Client,
  GatewayIntentBits,
} from "@cc-discord-framework/core";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
await client.login(); // トークンは DISCORD_TOKEN 環境変数から自動使用`;

/** client/src/commands/system/PingCommand.ts と同一の実コード。 */
const FRAMEWORK_COMMAND = `// src/commands/PingCommand.ts — 置くだけ。登録・同期は自動
import {
  Command,
  type ChatInputCommandInteraction,
} from "@cc-discord-framework/core";

@Command.define({ description: "Botの応答速度を確認します。" })
export class PingCommand extends Command {
  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.reply(\`Pong! \${this.client.ws.ping}ms\`);
  }
}`;

/** 行数はコード文字列から数える(コピーの数字が実物とずれないように)。 */
const VANILLA_LINES = VANILLA.split("\n").length;
const FRAMEWORK_LINES =
	FRAMEWORK_INDEX.split("\n").length + FRAMEWORK_COMMAND.split("\n").length;

export default function Comparison(): ReactNode {
	return (
		<section className={styles.section}>
			<div className="container">
				<SectionHeader
					eyebrow="02 · discord.js との関係"
					title={
						<>
							discord.js を、
							<br className="lp-br-sm" />
							<span className={styles.accent}>置き換えない。</span>
						</>
					}
					lead={
						<>
							全 API を再エクスポートし(<code>export * from &quot;discord.js&quot;</code>)、
							その上へ規約と型の構造を足します。同じ <code>/ping</code> を
							動かすまでのコードが、これだけ変わります。
						</>
					}
				/>
				<div className={styles.grid}>
					{/* 素の discord.js 側: 一段沈めて脇役にする。 */}
					<div className={clsx(styles.column, styles.columnPlain)}>
						<p className={styles.columnLabel}>
							<span className={styles.labelName}>discord.js のみ</span>
							<span className={styles.labelMeta}>1ファイル · {VANILLA_LINES}行</span>
						</p>
						<CodeWindow filename="index.ts" badge="手動配線">
							{VANILLA}
						</CodeWindow>
					</div>
					{/* フレームワーク側: 上辺のアンバーの罫で主役を示す。 */}
					<div className={clsx(styles.column, styles.columnBrand)}>
						<p className={styles.columnLabel}>
							<span className={clsx(styles.labelName, styles.labelBrand)}>
								cc-discord-framework
							</span>
							<span className={styles.labelMeta}>2ファイル · {FRAMEWORK_LINES}行</span>
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
				<p className={styles.footnote}>
					<code>interaction</code> は discord.js の型そのもの。2つ目のコマンドは
					ファイルをもう1枚置くだけで、左のコードのように登録行や分岐が増えることはありません。
				</p>
			</div>
		</section>
	);
}
