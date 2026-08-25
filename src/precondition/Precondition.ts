import type { Awaitable, ChatInputCommandInteraction, Message } from "discord.js";
import { UserError } from "../errors.js";
import { Component, type ComponentOptions } from "../component/Component.js";
import { defineOptions } from "../component/metadata.js";
import type { Command } from "../command/Command.js";

/**
 * Precondition 名のレジストリ。コマンドの `preconditions: [...]` の型付けに
 * 使われます。各 Precondition の隣で宣言マージしてください:
 *
 * ```ts
 * declare module "@cc-discord-framework/core" {
 *   interface Preconditions {
 *     OwnerOnly: never;
 *   }
 * }
 * ```
 *
 * 宣言マージが1つもない間は任意の文字列を受け付け、宣言した時点で
 * 宣言済みの名前だけが型チェックを通ります。いずれの場合も、未知の名前は
 * 必ず起動時エラーになります。
 */
export interface Preconditions {}

/** 有効な Precondition 名({@link Preconditions} を参照)。 */
export type PreconditionName = keyof Preconditions extends never
	? string
	: keyof Preconditions;

/** Precondition の判定結果: 通過、またはユーザー向けエラー付きの拒否。 */
export type PreconditionResult = { ok: true } | { ok: false; error: UserError };

export interface PreconditionOptions extends ComponentOptions {}

/**
 * コマンド実行前に走る再利用可能なガード。
 *
 * サポートするコマンドフローごとに判定を実装します。コマンドが使用する
 * フローは、そのコマンドに付いた **すべての** Precondition が実装している
 * 必要があります — 未実装は黙って通過せず、明示的に失敗します。
 *
 * ```ts
 * @Precondition.define()
 * export class OwnerOnlyPrecondition extends Precondition {
 *   override chatInputRun(interaction: ChatInputCommandInteraction) {
 *     return interaction.user.id === OWNER_ID
 *       ? this.ok()
 *       : this.deny("このコマンドはBotのオーナーのみ使用できます。");
 *   }
 * }
 * ```
 *
 * Precondition 名はクラス名から `Precondition` サフィックスを除いた形が
 * 既定です(`OwnerOnlyPrecondition` → `OwnerOnly`)。
 */
export abstract class Precondition extends Component {
	/** Precondition のメタデータを宣言します。省略可能です(名前は導出されます)。 */
	public static define(options: PreconditionOptions = {}) {
		return defineOptions<Precondition>(options);
	}

	/** スラッシュコマンド呼び出しに対する判定。 */
	public chatInputRun?(
		interaction: ChatInputCommandInteraction,
		command: Command,
	): Awaitable<PreconditionResult>;

	/** プレフィックス(メッセージ)コマンド呼び出しに対する判定。 */
	public messageRun?(message: Message, command: Command): Awaitable<PreconditionResult>;

	/** 通過を表す結果。 */
	protected ok(): PreconditionResult {
		return { ok: true };
	}

	/** ユーザー向けの理由付きの拒否。 */
	protected deny(reason: string, options?: { context?: unknown }): PreconditionResult {
		return {
			ok: false,
			error: new UserError(reason, { identifier: this.name, context: options?.context }),
		};
	}
}
