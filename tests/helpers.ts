import type { ChatInputCommandInteraction, Message } from "discord.js";
import { Client } from "../src/index.js";

/** テスト用のオフラインクライアント(自動探索なし・ログ抑制)。 */
export function createTestClient(options: Partial<ConstructorParameters<typeof Client>[0]> = {}) {
	return new Client({
		intents: [],
		baseDirectory: null,
		logger: { level: "silent" },
		...options,
	});
}

/**
 * ディスパッチパイプラインを通せる最小のスラッシュコマンドインタラクション偽物。
 * `overrides` でギルド内呼び出しや権限の状態を上書きできます。
 */
export function fakeChatInput(commandName: string, overrides: Record<string, unknown> = {}) {
	const replies: unknown[] = [];
	const interaction = {
		commandName,
		deferred: false,
		replied: false,
		inGuild: () => false,
		memberPermissions: null,
		appPermissions: null,
		reply: async (payload: unknown) => {
			replies.push(payload);
		},
		followUp: async (payload: unknown) => {
			replies.push(payload);
		},
		...overrides,
	};
	return { interaction: interaction as unknown as ChatInputCommandInteraction, replies };
}

/** メッセージコマンドのディスパッチを通せる最小のメッセージ偽物。 */
export function fakeMessage(content: string) {
	const replies: unknown[] = [];
	const message = {
		content,
		author: { bot: false },
		webhookId: null,
		member: null,
		guild: null,
		inGuild: () => false,
		reply: async (payload: unknown) => {
			replies.push(payload);
		},
	};
	return { message: message as unknown as Message, replies };
}
