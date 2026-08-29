import {
	Collection,
	MessageFlags,
	PermissionsBitField,
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	type Message,
	type PermissionResolvable,
	type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { ComponentLoadError, FrameworkError, UserError } from "../errors.js";
import { FrameworkEvents, type CommandRunPayload, type CommandsSyncedResult } from "../events.js";
import { ComponentStore } from "../component/ComponentStore.js";
import type { PreconditionStore } from "../precondition/PreconditionStore.js";
import { Command, type CommandOptions } from "./Command.js";

/** Discord のチャット入力コマンド命名規則。 */
const CHAT_INPUT_NAME = /^[-_\p{L}\p{N}]{1,32}$/u;

/**
 * {@link Command} コンポーネントのストア。`commands/` を走査します。
 *
 * コマンドのランタイムも担います: インタラクション / メッセージの
 * ディスパッチ、権限・Precondition ゲート、アプリケーションコマンド同期。
 */
export class CommandStore extends ComponentStore<Command> {
	/** 小文字化した名前・別名 → コマンド(メッセージディスパッチ用)。 */
	readonly #index = new Collection<string, Command>();

	/** メンション対象(`"self"` またはユーザー ID)→ コマンド(メンションディスパッチ用)。 */
	readonly #mentionIndex = new Collection<string, Command>();

	public constructor() {
		super({ name: "commands", base: Command });
	}

	/** 名前または別名でコマンドを検索します(大文字小文字を区別しません)。 */
	public lookup(name: string): Command | undefined {
		return this.#index.get(name.toLowerCase());
	}

	/** メンションで反応するコマンドが1つでもあるか。 */
	public get hasMentionCommands(): boolean {
		return this.#mentionIndex.size > 0;
	}

	protected override applyOptions(command: Command, options: CommandOptions): void {
		Object.assign(command, {
			description: options.description ?? "",
			options: options.options ?? [],
			aliases: options.aliases ?? [],
			preconditions: options.preconditions ?? [],
			requiredUserPermissions: options.requiredUserPermissions ?? null,
			requiredClientPermissions: options.requiredClientPermissions ?? null,
			defaultMemberPermissions: options.defaultMemberPermissions ?? null,
			guildIds: options.guildIds ?? null,
			nameLocalizations: options.nameLocalizations ?? null,
			descriptionLocalizations: options.descriptionLocalizations ?? null,
			mentions: resolveMentions(command, options),
		});

		if (command.supportsChatInput) {
			if (!CHAT_INPUT_NAME.test(command.name) || command.name !== command.name.toLowerCase()) {
				throw new ComponentLoadError(
					`スラッシュコマンド名 "${command.name}" が不正です(小文字・1〜32文字・英数と - _ のみ)`,
				);
			}
			if (!command.description || command.description.length > 100) {
				throw new ComponentLoadError(
					`スラッシュコマンド "${command.name}" には1〜100文字の説明が必要です — @Command.define({ description }) で設定してください`,
				);
			}
		}
	}

	protected override bind(command: Command): void {
		const keys = [command.name, ...command.aliases].map((key) => key.toLowerCase());
		for (const key of keys) {
			const existing = this.#index.get(key);
			if (existing) {
				throw new ComponentLoadError(
					`"${command.name}" の名前/別名 "${key}" は "${existing.name}" がすでに使用しています`,
				);
			}
		}
		for (const target of command.mentions ?? []) {
			const existing = this.#mentionIndex.get(target);
			if (existing) {
				throw new ComponentLoadError(
					`"${command.name}" のメンション対象 "${target}" は "${existing.name}" がすでに使用しています`,
				);
			}
		}
		for (const key of keys) this.#index.set(key, command);
		for (const target of command.mentions ?? []) this.#mentionIndex.set(target, command);
	}

	protected override unbind(command: Command): void {
		for (const [key, value] of this.#index) {
			if (value === command) this.#index.delete(key);
		}
		for (const [key, value] of this.#mentionIndex) {
			if (value === command) this.#mentionIndex.delete(key);
		}
	}

	/**
	 * ロードされていない Precondition を参照するコマンドを起動時に検出します。
	 * 全ストアのロード完了後にクライアントが呼びます。
	 */
	public validateReferences(preconditions: PreconditionStore): void {
		for (const command of this.values()) {
			for (const name of command.preconditions) {
				if (!preconditions.has(name)) {
					throw new ComponentLoadError(
						`コマンド "${command.name}" が未知の Precondition "${name}" を参照しています`,
						{ path: command.location },
					);
				}
			}
		}
	}

	/** スラッシュコマンドのインタラクションを担当コマンドへルーティングします。 */
	public async dispatchChatInput(interaction: ChatInputCommandInteraction): Promise<void> {
		const command = this.get(interaction.commandName);
		if (!command?.chatInputRun) return;

		const payload: CommandRunPayload = { type: "chatInput", command, interaction };
		try {
			const denial = await this.#gate(command, payload);
			if (denial) return await this.#handleDenied(denial, payload);

			this.container.client.emit(FrameworkEvents.CommandRun, payload);
			await command.chatInputRun(interaction);
		} catch (error) {
			await this.#handleError(error, payload);
		}
	}

	/** autocomplete インタラクションを担当コマンドへルーティングします。 */
	public async dispatchAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
		const command = this.get(interaction.commandName);
		if (!command?.autocompleteRun) return;

		try {
			await command.autocompleteRun(interaction);
		} catch (error) {
			const payload: CommandRunPayload = { type: "autocomplete", command, interaction };
			const handled = this.container.client.emit(FrameworkEvents.CommandError, error, payload);
			if (!handled) {
				command.logger.error({ err: error }, "autocomplete が失敗しました");
			}
		}
	}

	/**
	 * メッセージからプレフィックスコマンドを解析して実行します。解決済み
	 * プレフィックスはクライアントが渡します。Bot と Webhook は無視されます。
	 */
	public async dispatchMessage(message: Message, prefixes: readonly string[]): Promise<void> {
		if (message.author.bot || message.webhookId || !message.content) return;

		// 重複するプレフィックス("!" と "!!")でも正しく解析できるよう最長一致を採用する。
		const prefix = prefixes
			.filter((value) => value && message.content.startsWith(value))
			.sort((a, b) => b.length - a.length)[0];
		if (prefix === undefined) return;

		const body = message.content.slice(prefix.length).trim();
		if (!body) return;

		const [first = "", ...args] = body.split(/\s+/);
		const command = this.lookup(first);
		if (!command?.messageRun) return;

		const payload: CommandRunPayload = { type: "message", command, message, args };
		try {
			const denial = await this.#gate(command, payload);
			if (denial) return await this.#handleDenied(denial, payload);

			this.container.client.emit(FrameworkEvents.CommandRun, payload);
			await command.messageRun(message, args);
		} catch (error) {
			await this.#handleError(error, payload);
		}
	}

	/**
	 * メッセージが対象へのメンションを含んでいれば、担当のメンションコマンドを
	 * 実行します。対象にマッチしたかを返します(拒否・実行失敗でも `true` =
	 * そのメッセージはメンションコマンドが消費した、という意味です)。
	 *
	 * 複数のコマンドの対象にマッチした場合は、本文で **最初に現れた** 対象の
	 * コマンドを1つだけ実行します。Bot と Webhook は無視されます。
	 */
	public async dispatchMention(message: Message): Promise<boolean> {
		if (message.author.bot || message.webhookId || !message.content) return false;

		// リプライのピンは content に現れないため、mentions コレクションでは
		// なく本文そのものを見る(返信しただけで誤発火させない)。
		let matched: { command: Command; id: string; index: number } | undefined;
		for (const [target, command] of this.#mentionIndex) {
			const id = target === "self" ? this.container.client.user?.id : target;
			if (!id) continue;
			const match = new RegExp(`<@!?${id}>`).exec(message.content);
			if (!match) continue;
			if (matched === undefined || match.index < matched.index) {
				matched = { command, id, index: match.index };
			}
		}
		if (matched === undefined) return false;

		const { command, id } = matched;
		const content = message.content.replace(new RegExp(`<@!?${id}>`, "g"), "").trim();

		const payload: CommandRunPayload = { type: "mention", command, message, content };
		try {
			const denial = await this.#gate(command, payload);
			if (denial) {
				await this.#handleDenied(denial, payload);
				return true;
			}

			this.container.client.emit(FrameworkEvents.CommandRun, payload);
			// mentionRun の存在は applyOptions が保証している(無ければロード時に失敗)。
			await command.mentionRun?.(message, content);
		} catch (error) {
			await this.#handleError(error, payload);
		}
		return true;
	}

	/**
	 * すべてのスラッシュ対応コマンドを一括上書きで Discord に登録します。
	 * `guildIds`(またはクライアント既定の `applicationGuildIds`)を持つ
	 * コマンドはギルド毎に、それ以外はグローバルに登録されます。
	 * 無効化しない限り ready 時に自動実行されます。
	 */
	public async syncApplicationCommands(
		defaultGuildIds?: readonly string[],
	): Promise<CommandsSyncedResult> {
		const application = this.container.client.application;
		if (!application) {
			throw new FrameworkError(
				"クライアントが ready になる前にアプリケーションコマンドは同期できません",
			);
		}

		const globalBodies: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
		const guildBodies = new Map<string, RESTPostAPIChatInputApplicationCommandsJSONBody[]>();
		// 既定ギルドはコマンドが0件になった場合も空配列で上書きする。
		// ここで先にバケットを作らないと、前回登録したコマンドが Discord 側に残る。
		for (const guildId of defaultGuildIds ?? []) guildBodies.set(guildId, []);

		for (const command of this.values()) {
			if (!command.supportsChatInput) continue;
			const body = command.toApplicationCommand();
			const guildIds = command.guildIds ?? defaultGuildIds;
			if (guildIds?.length) {
				for (const guildId of guildIds) {
					const bucket = guildBodies.get(guildId) ?? [];
					bucket.push(body);
					guildBodies.set(guildId, bucket);
				}
			} else {
				globalBodies.push(body);
			}
		}

		await application.commands.set(globalBodies);
		const guilds = new Map<string, number>();
		for (const [guildId, bodies] of guildBodies) {
			await application.commands.set(bodies, guildId);
			guilds.set(guildId, bodies.length);
		}

		const result: CommandsSyncedResult = { global: globalBodies.length, guilds };
		this.logger.info(
			{ global: result.global, guilds: Object.fromEntries(guilds) },
			"アプリケーションコマンドを同期しました",
		);
		this.container.client.emit(FrameworkEvents.CommandsSynced, result);
		return result;
	}

	/** 権限チェック + Precondition。拒否なら UserError、続行なら null。 */
	async #gate(
		command: Command,
		payload: CommandRunPayload & { type: "chatInput" | "message" | "mention" },
	): Promise<UserError | null> {
		const inGuild =
			payload.type === "chatInput" ? payload.interaction.inGuild() : payload.message.inGuild();

		const texts = this.container.texts;

		if (command.requiredUserPermissions !== null) {
			if (!inGuild) {
				return new UserError(texts.guildOnly, { identifier: "userPermissions" });
			}
			const permissions =
				payload.type === "chatInput"
					? payload.interaction.memberPermissions
					: (payload.message.member?.permissions ?? null);
			const missing = missingPermissions(
				permissions,
				command.requiredUserPermissions,
				texts.unknownPermissions,
			);
			if (missing) {
				return new UserError(texts.missingUserPermissions(missing), {
					identifier: "userPermissions",
				});
			}
		}

		if (command.requiredClientPermissions !== null) {
			if (!inGuild) {
				return new UserError(texts.guildOnly, { identifier: "clientPermissions" });
			}
			const permissions =
				payload.type === "chatInput"
					? payload.interaction.appPermissions
					: payload.message.inGuild() && payload.message.guild.members.me
						? payload.message.channel.permissionsFor(payload.message.guild.members.me)
						: null;
			const missing = missingPermissions(
				permissions,
				command.requiredClientPermissions,
				texts.unknownPermissions,
			);
			if (missing) {
				return new UserError(texts.missingClientPermissions(missing), {
					identifier: "clientPermissions",
				});
			}
		}

		if (command.preconditions.length > 0) {
			const preconditions = this.container.stores.get("preconditions");
			const result = await preconditions.run(command.preconditions, payload);
			if (!result.ok) return result.error;
		}

		return null;
	}

	async #handleDenied(
		error: UserError,
		payload: CommandRunPayload & { type: "chatInput" | "message" | "mention" },
	): Promise<void> {
		const handled = this.container.client.emit(FrameworkEvents.CommandDenied, error, payload);
		if (handled) return;
		await this.#replyTo(payload, error.message);
	}

	async #handleError(error: unknown, payload: CommandRunPayload): Promise<void> {
		const handled = this.container.client.emit(FrameworkEvents.CommandError, error, payload);
		if (handled) return;

		if (payload.type === "autocomplete") {
			payload.command.logger.error({ err: error }, "autocomplete が失敗しました");
			return;
		}
		if (error instanceof UserError) {
			await this.#replyTo(payload, error.message);
			return;
		}
		payload.command.logger.error({ err: error }, "コマンドの実行に失敗しました");
		await this.#replyTo(payload, this.container.texts.commandError);
	}

	async #replyTo(
		payload: CommandRunPayload & { type: "chatInput" | "message" | "mention" },
		content: string,
	): Promise<void> {
		try {
			if (payload.type === "chatInput") {
				const { interaction } = payload;
				if (interaction.deferred || interaction.replied) {
					await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
				} else {
					await interaction.reply({ content, flags: MessageFlags.Ephemeral });
				}
			} else {
				await payload.message.reply({
					content,
					allowedMentions: { repliedUser: false },
				});
			}
		} catch (error) {
			payload.command.logger.warn(
				{ err: error },
				"コマンドのフィードバック送信に失敗しました",
			);
		}
	}
}

/**
 * `mentions` オプションを解決します。省略時は mentionRun を実装していれば
 * `["self"]`(Bot 自身へのメンションに反応)、指定に問題があればロード時に
 * 失敗させます — メンションに反応しない設定ミスは実行時には気づけないためです。
 */
function resolveMentions(command: Command, options: CommandOptions): readonly string[] | null {
	const raw = options.mentions;
	const hasRun = typeof command.mentionRun === "function";

	let mentions: readonly string[] | null;
	if (raw === undefined) {
		mentions = hasRun ? ["self"] : null;
	} else if (raw === true) {
		mentions = ["self"];
	} else if (raw === false) {
		mentions = null;
	} else {
		if (raw.length === 0) {
			throw new ComponentLoadError(
				`コマンド "${command.name}" の mentions に空の配列は指定できません — ` +
					"省略するか false を指定してください",
			);
		}
		for (const target of raw) {
			if (target !== "self" && !/^\d+$/.test(target)) {
				throw new ComponentLoadError(
					`コマンド "${command.name}" のメンション対象 "${target}" が不正です` +
						'(ユーザー ID の数字列、または Bot 自身を指す "self" のみ)',
				);
			}
		}
		mentions = [...new Set(raw)];
	}

	if (mentions !== null && !hasRun) {
		throw new ComponentLoadError(
			`コマンド "${command.name}" は mentions を指定していますが mentionRun がありません — ` +
				"mentionRun(message, content) を実装してください",
		);
	}
	return mentions;
}

/**
 * 不足している権限名の一覧を返します。不足がなければ null。
 * 権限情報そのものを取得できないときは `unknown`(文言カタログの
 * `unknownPermissions`)だけを載せた一覧になります。
 */
function missingPermissions(
	permissions: Readonly<PermissionsBitField> | null,
	required: PermissionResolvable,
	unknown: string,
): readonly string[] | null {
	if (!permissions) return [unknown];
	const missing = permissions.missing(required);
	return missing.length > 0 ? missing : null;
}
