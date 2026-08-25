import { describe, expect, test } from "bun:test";
import type { ChatInputCommandInteraction } from "discord.js";
import { Command, FrameworkEvents, Precondition, UserError } from "../src/index.js";
import { createTestClient, fakeChatInput, fakeMessage } from "./helpers.js";

describe("スラッシュコマンドのディスパッチ", () => {
	test("既定ギルドにコマンドがなくても空配列で同期する", async () => {
		const calls: Array<{ bodies: readonly unknown[]; guildId?: string }> = [];
		const client = createTestClient();
		await client.load();
		Object.defineProperty(client, "application", {
			configurable: true,
			value: {
				commands: {
					set: async (bodies: readonly unknown[], guildId?: string) => {
						calls.push({ bodies, guildId });
					},
				},
			},
			writable: true,
		});

		const result = await client.stores
			.get("commands")
			.syncApplicationCommands(["development-guild"]);

		expect(calls).toEqual([
			{ bodies: [], guildId: undefined },
			{ bodies: [], guildId: "development-guild" },
		]);
		expect(result.guilds.get("development-guild")).toBe(0);
		await client.destroy();
	});

	test("該当コマンドを実行し commandRun を発火する", async () => {
		const runs: string[] = [];

		@Command.define({ description: "Pong!" })
		class PingCommand extends Command {
			override async chatInputRun() {
				runs.push("ping");
			}
		}

		const client = createTestClient();
		client.register(PingCommand);
		await client.load();
		client.on(FrameworkEvents.CommandRun, (payload) => runs.push(`event:${payload.command.name}`));

		const { interaction } = fakeChatInput("ping");
		await client.stores.get("commands").dispatchChatInput(interaction);

		expect(runs).toEqual(["event:ping", "ping"]);
	});

	test("未知のコマンドは無視される", async () => {
		const client = createTestClient();
		await client.load();
		const { interaction, replies } = fakeChatInput("missing");
		await client.stores.get("commands").dispatchChatInput(interaction);
		expect(replies).toEqual([]);
	});

	test("Precondition の拒否は実行を止め commandDenied を発火する", async () => {
		let ran = false;

		class OwnerOnlyPrecondition extends Precondition {
			override chatInputRun() {
				return this.deny("オーナー専用です。");
			}
		}

		@Command.define({ description: "危険", preconditions: ["OwnerOnly"] })
		class ShutdownCommand extends Command {
			override async chatInputRun() {
				ran = true;
			}
		}

		const client = createTestClient();
		client.register(OwnerOnlyPrecondition, ShutdownCommand);
		await client.load();

		const denials: string[] = [];
		client.on(FrameworkEvents.CommandDenied, (error) =>
			denials.push(`${error.identifier}:${error.message}`),
		);

		const { interaction } = fakeChatInput("shutdown");
		await client.stores.get("commands").dispatchChatInput(interaction);

		expect(ran).toBe(false);
		expect(denials).toEqual(["OwnerOnly:オーナー専用です。"]);
	});

	test("commandDenied のリスナーがなければ拒否理由がユーザーへ返信される", async () => {
		class NeverPrecondition extends Precondition {
			override chatInputRun() {
				return this.deny("あなたは使えません。");
			}
		}

		@Command.define({ description: "ガード付き", preconditions: ["Never"] })
		class GuardedCommand extends Command {
			override async chatInputRun() {}
		}

		const client = createTestClient();
		client.register(NeverPrecondition, GuardedCommand);
		await client.load();

		const { interaction, replies } = fakeChatInput("guarded");
		await client.stores.get("commands").dispatchChatInput(interaction);

		expect(replies).toHaveLength(1);
		expect((replies[0] as { content: string }).content).toBe("あなたは使えません。");
	});

	test("コマンドが投げた UserError はユーザー向け返信になる", async () => {
		@Command.define({ description: "失敗する" })
		class FailCommand extends Command {
			override async chatInputRun() {
				throw new UserError("それはできません。");
			}
		}

		const client = createTestClient();
		client.register(FailCommand);
		await client.load();

		const { interaction, replies } = fakeChatInput("fail");
		await client.stores.get("commands").dispatchChatInput(interaction);
		expect((replies[0] as { content: string }).content).toBe("それはできません。");
	});

	test("予期しないエラーは commandError を発火する", async () => {
		@Command.define({ description: "クラッシュする" })
		class CrashCommand extends Command {
			override async chatInputRun() {
				throw new Error("boom");
			}
		}

		const client = createTestClient();
		client.register(CrashCommand);
		await client.load();

		const errors: unknown[] = [];
		client.on(FrameworkEvents.CommandError, (error) => errors.push(error));

		const { interaction } = fakeChatInput("crash");
		await client.stores.get("commands").dispatchChatInput(interaction);
		expect(errors).toHaveLength(1);
		expect((errors[0] as Error).message).toBe("boom");
	});

	test("呼び出しフローを実装しない Precondition は明示的に失敗する", async () => {
		class MessageOnlyPrecondition extends Precondition {
			override messageRun() {
				return this.ok();
			}
		}

		@Command.define({ description: "ガード付き", preconditions: ["MessageOnly"] })
		class GuardedCommand extends Command {
			override async chatInputRun() {}
		}

		const client = createTestClient();
		client.register(MessageOnlyPrecondition, GuardedCommand);
		await client.load();

		const errors: unknown[] = [];
		client.on(FrameworkEvents.CommandError, (error) => errors.push(error));

		const { interaction } = fakeChatInput("guarded");
		await client.stores.get("commands").dispatchChatInput(interaction);
		expect((errors[0] as Error).message).toMatch(/chatInputRun を実装していません/);
	});

	test("未知の Precondition を参照するコマンドは起動時に失敗する", async () => {
		@Command.define({ description: "ガード付き", preconditions: ["DoesNotExist"] })
		class GuardedCommand extends Command {
			override async chatInputRun() {}
		}

		const client = createTestClient();
		client.register(GuardedCommand);
		expect(client.load()).rejects.toThrow(/未知の Precondition "DoesNotExist"/);
	});
});

describe("メッセージコマンドのディスパッチ", () => {
	function setup() {
		const runs: Array<{ name: string; args: string[] }> = [];

		@Command.define({ description: "エコー", aliases: ["say"] })
		class EchoCommand extends Command {
			override async messageRun(_message: unknown, args: string[]) {
				runs.push({ name: "echo", args });
			}
		}

		const client = createTestClient({ defaultPrefix: "!" });
		client.register(EchoCommand);
		return { client, runs };
	}

	test("プレフィックス・コマンド名・引数を解析する", async () => {
		const { client, runs } = setup();
		await client.load();

		const { message } = fakeMessage("!echo hello   world");
		await client.stores.get("commands").dispatchMessage(message, ["!"]);
		expect(runs).toEqual([{ name: "echo", args: ["hello", "world"] }]);
	});

	test("別名と大文字小文字を区別しない検索が機能する", async () => {
		const { client, runs } = setup();
		await client.load();

		const { message } = fakeMessage("!SAY hi");
		await client.stores.get("commands").dispatchMessage(message, ["!"]);
		expect(runs).toEqual([{ name: "echo", args: ["hi"] }]);
	});

	test("重複するプレフィックスは最長一致で解決される", async () => {
		const { client, runs } = setup();
		await client.load();

		const { message } = fakeMessage("!!echo hi");
		await client.stores.get("commands").dispatchMessage(message, ["!", "!!"]);
		expect(runs).toEqual([{ name: "echo", args: ["hi"] }]);
	});

	test("プレフィックスなし・Bot 発言は無視される", async () => {
		const { client, runs } = setup();
		await client.load();
		const commands = client.stores.get("commands");

		const { message: noPrefix } = fakeMessage("echo hi");
		await commands.dispatchMessage(noPrefix, ["!"]);

		const { message: bot } = fakeMessage("!echo hi");
		(bot.author as { bot: boolean }).bot = true;
		await commands.dispatchMessage(bot, ["!"]);

		expect(runs).toEqual([]);
	});

	test("スラッシュ専用コマンドはメッセージから呼び出せない", async () => {
		let ran = false;

		@Command.define({ description: "スラッシュ専用" })
		class OnlySlashCommand extends Command {
			override async chatInputRun(_interaction: ChatInputCommandInteraction) {
				ran = true;
			}
		}

		const client = createTestClient({ defaultPrefix: "!" });
		client.register(OnlySlashCommand);
		await client.load();

		const { message } = fakeMessage("!only-slash");
		await client.stores.get("commands").dispatchMessage(message, ["!"]);
		expect(ran).toBe(false);
	});
});
