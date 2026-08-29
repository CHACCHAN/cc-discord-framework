import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import {
	Command,
	createClient,
	defaultClientTexts,
	loadClientConfig,
	PermissionsBitField,
	resolveClientTexts,
} from "../src/index.js";
import { createTestClient, fakeChatInput } from "./helpers.js";

const FIXTURES = join(import.meta.dir, "fixtures");

/** requiredUserPermissions 付きのコマンド(ギルド外なら guildOnly で拒否される)。 */
function defineLockedCommand() {
	@Command.define({ description: "権限付き", requiredUserPermissions: ["ManageGuild"] })
	class LockedCommand extends Command {
		override async chatInputRun() {}
	}
	return LockedCommand;
}

/** requiredClientPermissions 付きのコマンド(Bot 側の権限がゲートされる)。 */
function defineBotLockedCommand() {
	@Command.define({ description: "Bot権限付き", requiredClientPermissions: ["SendMessages"] })
	class BotLockedCommand extends Command {
		override async chatInputRun() {}
	}
	return BotLockedCommand;
}

/** 必ず予期しないエラーで失敗するコマンド。 */
function defineCrashCommand() {
	@Command.define({ description: "クラッシュする" })
	class CrashCommand extends Command {
		override async chatInputRun() {
			throw new Error("boom");
		}
	}
	return CrashCommand;
}

function contentOf(replies: unknown[]): string {
	expect(replies).toHaveLength(1);
	return (replies[0] as { content: string }).content;
}

describe("resolveClientTexts", () => {
	test("何も指定しなければ既定値になる", () => {
		expect(resolveClientTexts()).toEqual(defaultClientTexts);
	});

	test("上書きした項目だけが変わり、それ以外は既定値のまま", () => {
		const texts = resolveClientTexts({ guildOnly: "Server only." });

		expect(texts.guildOnly).toBe("Server only.");
		expect(texts.commandError).toBe(defaultClientTexts.commandError);
		expect(texts.missingUserPermissions(["ManageGuild"])).toBe(
			defaultClientTexts.missingUserPermissions(["ManageGuild"]),
		);
	});
});

describe("既定の文言がユーザーへの返信に使われる", () => {
	test("ギルド外からの権限付きコマンドは guildOnly の既定文言で拒否される", async () => {
		const client = createTestClient();
		client.register(defineLockedCommand());
		await client.load();

		const { interaction, replies } = fakeChatInput("locked");
		await client.stores.get("commands").dispatchChatInput(interaction);

		expect(contentOf(replies)).toBe("このコマンドはサーバー内でのみ使用できます。");
	});

	test("実行者の権限不足は不足している権限名の一覧付きで拒否される", async () => {
		const client = createTestClient();
		client.register(defineLockedCommand());
		await client.load();

		const { interaction, replies } = fakeChatInput("locked", {
			inGuild: () => true,
			memberPermissions: new PermissionsBitField(["SendMessages"]),
		});
		await client.stores.get("commands").dispatchChatInput(interaction);

		expect(contentOf(replies)).toBe("実行に必要な権限が不足しています: ManageGuild");
	});

	test("権限情報を取得できないときは unknownPermissions の文言が一覧に入る", async () => {
		const client = createTestClient();
		client.register(defineLockedCommand());
		await client.load();

		const { interaction, replies } = fakeChatInput("locked", {
			inGuild: () => true,
			memberPermissions: null,
		});
		await client.stores.get("commands").dispatchChatInput(interaction);

		expect(contentOf(replies)).toBe(
			"実行に必要な権限が不足しています: 不明(権限情報を取得できません)",
		);
	});

	test("予期しないエラーは commandError の既定文言で返信される", async () => {
		const client = createTestClient();
		client.register(defineCrashCommand());
		await client.load();

		const { interaction, replies } = fakeChatInput("crash");
		await client.stores.get("commands").dispatchChatInput(interaction);

		expect(contentOf(replies)).toBe("コマンドの実行中にエラーが発生しました。");
	});
});

describe("texts オプションによる上書き", () => {
	test("上書きした項目の返信だけが変わる", async () => {
		const client = createTestClient({
			texts: { guildOnly: "This command is server-only." },
		});
		client.register(defineLockedCommand(), defineCrashCommand());
		await client.load();
		const commands = client.stores.get("commands");

		const denied = fakeChatInput("locked");
		await commands.dispatchChatInput(denied.interaction);
		expect(contentOf(denied.replies)).toBe("This command is server-only.");

		const crashed = fakeChatInput("crash");
		await commands.dispatchChatInput(crashed.interaction);
		expect(contentOf(crashed.replies)).toBe("コマンドの実行中にエラーが発生しました。");
	});

	test("commandError の上書きがエラー返信に使われる", async () => {
		const client = createTestClient({
			texts: { commandError: "Something went wrong." },
		});
		client.register(defineCrashCommand());
		await client.load();

		const { interaction, replies } = fakeChatInput("crash");
		await client.stores.get("commands").dispatchChatInput(interaction);

		expect(contentOf(replies)).toBe("Something went wrong.");
	});

	test("Bot 権限の返信でも guildOnly の上書きが使われる", async () => {
		const client = createTestClient({
			texts: { guildOnly: "Server-only (bot permissions)." },
		});
		client.register(defineBotLockedCommand());
		await client.load();

		const { interaction, replies } = fakeChatInput("bot-locked");
		await client.stores.get("commands").dispatchChatInput(interaction);

		expect(contentOf(replies)).toBe("Server-only (bot permissions).");
	});

	test("unknownPermissions と missingClientPermissions の上書きが Bot 権限の返信に使われる", async () => {
		const client = createTestClient({
			texts: {
				unknownPermissions: "unknown",
				missingClientPermissions: (permissions) => `Bot lacks: ${permissions.join(", ")}`,
			},
		});
		client.register(defineBotLockedCommand());
		await client.load();

		// appPermissions が null: 権限情報を取得できないケース。
		const { interaction, replies } = fakeChatInput("bot-locked", {
			inGuild: () => true,
			appPermissions: null,
		});
		await client.stores.get("commands").dispatchChatInput(interaction);

		expect(contentOf(replies)).toBe("Bot lacks: unknown");
	});

	test("関数エントリも上書きでき、不足権限の一覧が渡される", async () => {
		const client = createTestClient({
			texts: {
				missingUserPermissions: (permissions) =>
					`Missing permissions: ${permissions.join(" / ")}`,
			},
		});
		client.register(defineLockedCommand());
		await client.load();

		const { interaction, replies } = fakeChatInput("locked", {
			inGuild: () => true,
			memberPermissions: new PermissionsBitField(["SendMessages"]),
		});
		await client.stores.get("commands").dispatchChatInput(interaction);

		expect(contentOf(replies)).toBe("Missing permissions: ManageGuild");
	});
});

describe("設定ディレクトリ経由の texts", () => {
	test("設定ファイルの texts は loadClientConfig の結果に残る", async () => {
		const options = await loadClientConfig(join(FIXTURES, "config-texts"));

		expect(options.texts).toEqual({ guildOnly: "サーバー限定のコマンドです。" });
	});

	test("設定ファイルの texts が動いているクライアントに届く", async () => {
		const client = await createClient(join(FIXTURES, "config-texts"));
		client.register(defineLockedCommand());
		await client.load();

		expect(client.container.texts.guildOnly).toBe("サーバー限定のコマンドです。");
		expect(client.container.texts.commandError).toBe(defaultClientTexts.commandError);

		const { interaction, replies } = fakeChatInput("locked");
		await client.stores.get("commands").dispatchChatInput(interaction);
		expect(contentOf(replies)).toBe("サーバー限定のコマンドです。");
	});
});
