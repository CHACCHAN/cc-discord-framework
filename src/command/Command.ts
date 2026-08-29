import {
	PermissionsBitField,
	type APIApplicationCommandOption,
	type AutocompleteInteraction,
	type Awaitable,
	type ChatInputCommandInteraction,
	type LocalizationMap,
	type Message,
	type PermissionResolvable,
	type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { Component, type ComponentOptions } from "../component/Component.js";
import { defineOptions } from "../component/metadata.js";
import type { PreconditionName } from "../precondition/Precondition.js";

/** `@Command.define({...})` で宣言するコマンドメタデータ。 */
export interface CommandOptions extends ComponentOptions {
	/** Discord に表示される説明。スラッシュコマンドでは必須です。 */
	description?: string;
	/**
	 * スラッシュコマンドのオプション(引数)。discord.js / discord-api-types
	 * が使う生の Discord API 形式そのままで、再抽象化はしません。
	 */
	options?: APIApplicationCommandOption[];
	/** プレフィックス(メッセージ)形式での別名。 */
	aliases?: string[];
	/** 実行前に通過が必要な Precondition 名。 */
	preconditions?: PreconditionName[];
	/** 呼び出しメンバーに必要な権限(ギルド内で検査)。 */
	requiredUserPermissions?: PermissionResolvable;
	/** Bot 自身にチャンネルで必要な権限(ギルド内で検査)。 */
	requiredClientPermissions?: PermissionResolvable;
	/** Discord 側のデフォルト権限ゲート(`default_member_permissions`)。 */
	defaultMemberPermissions?: PermissionResolvable;
	/**
	 * このスラッシュコマンドを登録するギルド。既定はクライアントの
	 * `applicationGuildIds`。どちらも未設定ならグローバル登録になります。
	 */
	guildIds?: string[];
	/** コマンド名のローカライズ。 */
	nameLocalizations?: LocalizationMap;
	/** 説明のローカライズ。 */
	descriptionLocalizations?: LocalizationMap;
	/**
	 * どのユーザーへのメンションに反応するか({@link Command.mentionRun} が
	 * 呼ばれる条件)。配列は反応するユーザー ID(snowflake)で、`"self"` は
	 * Bot 自身を指します。`true` は `["self"]` と同じ、`false` で無効です。
	 *
	 * 省略した場合、`mentionRun` を実装していれば `["self"]`(Bot 自身への
	 * メンションに反応)になります。
	 */
	mentions?: boolean | readonly string[];
}

/**
 * コマンド。必要なフローを1つ以上実装してください:
 *
 * - {@link Command.chatInputRun} — スラッシュコマンド(`/ping`)
 * - {@link Command.messageRun} — プレフィックスコマンド(`!ping`、`defaultPrefix` が必要)
 * - {@link Command.mentionRun} — メンションコマンド(`@Bot こんにちは`、既定は Bot 自身への
 *   メンションに反応。`mentions` オプションで任意のユーザー ID に変えられます)
 * - {@link Command.autocompleteRun} — スラッシュオプションの autocomplete
 *
 * ```ts
 * @Command.define({ description: "Pong! と返します。" })
 * export class PingCommand extends Command {
 *   override async chatInputRun(interaction: ChatInputCommandInteraction) {
 *     await interaction.reply("Pong!");
 *   }
 * }
 * ```
 *
 * コマンド名はクラス名から `Command` サフィックスを除きケバブケース化した
 * 形が既定です(`UserInfoCommand` → `user-info`)。
 */
export abstract class Command extends Component {
	/** Discord に表示される説明(メッセージ専用コマンドでは空文字)。 */
	declare public readonly description: string;

	/** スラッシュコマンドのオプション(生の Discord API データ)。 */
	declare public readonly options: readonly APIApplicationCommandOption[];

	/** プレフィックスコマンドの別名。 */
	declare public readonly aliases: readonly string[];

	/** このコマンドをガードする Precondition 名。 */
	declare public readonly preconditions: readonly PreconditionName[];

	/** 呼び出しメンバーに要求される権限。 */
	declare public readonly requiredUserPermissions: PermissionResolvable | null;

	/** Bot にチャンネルで要求される権限。 */
	declare public readonly requiredClientPermissions: PermissionResolvable | null;

	/** Discord 側のデフォルト権限ゲート。 */
	declare public readonly defaultMemberPermissions: PermissionResolvable | null;

	/** このスラッシュコマンドの登録先ギルド(`null` = クライアント既定 / グローバル)。 */
	declare public readonly guildIds: readonly string[] | null;

	/** 名前のローカライズ。 */
	declare public readonly nameLocalizations: LocalizationMap | null;

	/** 説明のローカライズ。 */
	declare public readonly descriptionLocalizations: LocalizationMap | null;

	/**
	 * 反応するメンションの対象(`"self"` = Bot 自身、それ以外はユーザー ID)。
	 * `null` ならメンションでは反応しません。
	 */
	declare public readonly mentions: readonly string[] | null;

	/** コマンドのメタデータを宣言します。 */
	public static define(options: CommandOptions = {}) {
		return defineOptions<Command>(options);
	}

	/** スラッシュコマンドの実装。 */
	public chatInputRun?(interaction: ChatInputCommandInteraction): Awaitable<unknown>;

	/** プレフィックス(メッセージ)コマンドの実装。 */
	public messageRun?(message: Message, args: string[]): Awaitable<unknown>;

	/**
	 * メンションコマンドの実装 — 対象({@link CommandOptions.mentions}、既定は
	 * Bot 自身)へのメンションを含むメッセージに反応します。`content` には
	 * 本文から対象のメンションを取り除いて trim した文字列が渡ります。
	 *
	 * 本文を読むため **MessageContent インテントが必要** です。リプライの
	 * ピン(返信時の通知)は本文に現れないので誤発火しません。Bot と Webhook
	 * の発言も無視されます。
	 */
	public mentionRun?(message: Message, content: string): Awaitable<unknown>;

	/** このコマンドのオプションに対する autocomplete ハンドラ。 */
	public autocompleteRun?(interaction: AutocompleteInteraction): Awaitable<unknown>;

	/** スラッシュコマンドとして公開されるかどうか。 */
	public get supportsChatInput(): boolean {
		return typeof this.chatInputRun === "function";
	}

	/** メッセージプレフィックスで呼び出せるかどうか。 */
	public get supportsMessage(): boolean {
		return typeof this.messageRun === "function";
	}

	/** メンションで呼び出せるかどうか。 */
	public get supportsMention(): boolean {
		return this.mentions !== null;
	}

	/**
	 * このスラッシュコマンドの登録に使う Discord API ペイロードを構築します。
	 * メタデータが扱わないフィールド(contexts、integration types など)を
	 * 追加したい場合は、オーバーライドして `super.toApplicationCommand()` の
	 * 結果を拡張してください。
	 */
	public toApplicationCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
		return {
			name: this.name,
			description: this.description,
			options: [...this.options],
			name_localizations: this.nameLocalizations ?? undefined,
			description_localizations: this.descriptionLocalizations ?? undefined,
			default_member_permissions:
				this.defaultMemberPermissions !== null
					? PermissionsBitField.resolve(this.defaultMemberPermissions).toString()
					: undefined,
		};
	}
}
