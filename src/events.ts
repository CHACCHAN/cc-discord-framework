import type { AutocompleteInteraction, ChatInputCommandInteraction, Message } from "discord.js";
import type { UserError } from "./errors.js";
// エイリアス: 下の `declare module "discord.js"` ブロック内では素の
// `Component` が discord.js 自身のメッセージコンポーネントクラスに解決されるため。
import type { Component as FrameworkComponent } from "./component/Component.js";
import type { Command } from "./command/Command.js";
import type { Listener } from "./listener/Listener.js";

/**
 * フレームワークがクライアント上で発火するイベント。通常の discord.js
 * イベントシステムに乗るため、`client.on(...)` と `Listener` コンポーネント
 * のどちらからでも観測できます。
 */
export const FrameworkEvents = {
	/** コンポーネントのロード完了: `(component)` */
	ComponentLoaded: "componentLoaded",
	/** コンポーネントのアンロード: `(component)` */
	ComponentUnloaded: "componentUnloaded",
	/** コマンド実行直前(Precondition 通過後): `(payload)` */
	CommandRun: "commandRun",
	/** Precondition がコマンドを拒否: `(error, payload)` */
	CommandDenied: "commandDenied",
	/** コマンド(または autocomplete)が例外を投げた: `(error, payload)` */
	CommandError: "commandError",
	/** リスナーコンポーネントが例外を投げた: `(error, listener)` */
	ListenerError: "listenerError",
	/** アプリケーションコマンドの Discord 同期完了: `(result)` */
	CommandsSynced: "commandsSynced",
} as const;

export type FrameworkEvent = (typeof FrameworkEvents)[keyof typeof FrameworkEvents];

/** コマンドイベントが指す1回の呼び出し。 */
export type CommandRunPayload =
	| { type: "chatInput"; command: Command; interaction: ChatInputCommandInteraction }
	| { type: "autocomplete"; command: Command; interaction: AutocompleteInteraction }
	| { type: "message"; command: Command; message: Message; args: string[] };

/** アプリケーションコマンド同期の結果サマリ。 */
export interface CommandsSyncedResult {
	/** グローバル登録されたコマンド数。 */
	global: number;
	/** ギルド毎の登録コマンド数。 */
	guilds: ReadonlyMap<string, number>;
}

declare module "discord.js" {
	interface ClientEvents {
		componentLoaded: [component: FrameworkComponent];
		componentUnloaded: [component: FrameworkComponent];
		commandRun: [payload: CommandRunPayload];
		commandDenied: [error: UserError, payload: CommandRunPayload];
		commandError: [error: unknown, payload: CommandRunPayload];
		listenerError: [error: unknown, listener: Listener];
		commandsSynced: [result: CommandsSyncedResult];
	}
}
