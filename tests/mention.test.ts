import { describe, expect, test } from "bun:test";
import type { Message } from "discord.js";
import { Command, FrameworkEvents, Precondition } from "../src/index.js";
import { createTestClient, fakeMessage } from "./helpers.js";

/** クライアントの user(Bot 自身)を差し込みます(ready 前は null のため)。 */
function setSelf(client: ReturnType<typeof createTestClient>, id: string): void {
	Object.defineProperty(client, "user", { configurable: true, value: { id } });
}

describe("メンションコマンドのディスパッチ", () => {
	function setup(targets?: readonly string[] | boolean) {
		const runs: Array<{ name: string; content: string }> = [];

		@Command.define({ mentions: targets })
		class HelperCommand extends Command {
			override async mentionRun(_message: Message, content: string) {
				runs.push({ name: "helper", content });
			}
		}

		const client = createTestClient();
		client.register(HelperCommand);
		return { client, runs };
	}

	test("指定したユーザー ID へのメンションで発火し、content からメンションが除かれる", async () => {
		const { client, runs } = setup(["123"]);
		await client.load();
		const commands = client.stores.get("commands");

		const { message } = fakeMessage("<@123> こんにちは");
		expect(await commands.dispatchMention(message)).toBe(true);

		const { message: nickname } = fakeMessage("<@!123> やあ");
		expect(await commands.dispatchMention(nickname)).toBe(true);

		const { message: middle } = fakeMessage("おい <@123> 教えて");
		expect(await commands.dispatchMention(middle)).toBe(true);

		expect(runs).toEqual([
			{ name: "helper", content: "こんにちは" },
			{ name: "helper", content: "やあ" },
			{ name: "helper", content: "おい  教えて" },
		]);
	});

	test("対象へのメンションがなければ何もしない", async () => {
		const { client, runs } = setup(["123"]);
		await client.load();
		const commands = client.stores.get("commands");

		const { message } = fakeMessage("<@456> こんにちは");
		expect(await commands.dispatchMention(message)).toBe(false);
		expect(runs).toEqual([]);
	});

	test("Bot と Webhook の発言は無視される", async () => {
		const { client, runs } = setup(["123"]);
		await client.load();
		const commands = client.stores.get("commands");

		const { message: bot } = fakeMessage("<@123> hi");
		(bot.author as { bot: boolean }).bot = true;
		expect(await commands.dispatchMention(bot)).toBe(false);

		const { message: webhook } = fakeMessage("<@123> hi");
		(webhook as { webhookId: string | null }).webhookId = "hook";
		expect(await commands.dispatchMention(webhook)).toBe(false);

		expect(runs).toEqual([]);
	});

	test("mentionRun を実装するだけで既定は Bot 自身へのメンションに反応する", async () => {
		const runs: string[] = [];

		@Command.define()
		class SelfCommand extends Command {
			override async mentionRun(_message: Message, content: string) {
				runs.push(content);
			}
		}

		const client = createTestClient();
		client.register(SelfCommand);
		await client.load();
		const commands = client.stores.get("commands");
		expect(commands.hasMentionCommands).toBe(true);

		// user が未解決(ready 前)のうちは発火しない。
		const { message: early } = fakeMessage("<@999> まだ");
		expect(await commands.dispatchMention(early)).toBe(false);

		setSelf(client, "999");
		const { message } = fakeMessage("<@999> 教えて");
		expect(await commands.dispatchMention(message)).toBe(true);
		expect(runs).toEqual(["教えて"]);
	});

	test("複数コマンドは本文で先に現れた対象が勝つ", async () => {
		const runs: string[] = [];

		@Command.define({ mentions: ["111"] })
		class FirstCommand extends Command {
			override async mentionRun() {
				runs.push("first");
			}
		}

		@Command.define({ mentions: ["222"] })
		class SecondCommand extends Command {
			override async mentionRun() {
				runs.push("second");
			}
		}

		const client = createTestClient();
		client.register(FirstCommand, SecondCommand);
		await client.load();
		const commands = client.stores.get("commands");

		const { message } = fakeMessage("<@222> と <@111> へ");
		await commands.dispatchMention(message);
		expect(runs).toEqual(["second"]);
	});

	test("ID が別の ID の接頭辞でも誤爆しない(<@12> と <@123>)", async () => {
		const runs: string[] = [];

		@Command.define({ mentions: ["12"] })
		class ShortCommand extends Command {
			override async mentionRun() {
				runs.push("short");
			}
		}

		@Command.define({ mentions: ["123"] })
		class LongCommand extends Command {
			override async mentionRun() {
				runs.push("long");
			}
		}

		const client = createTestClient();
		client.register(ShortCommand, LongCommand);
		await client.load();
		const commands = client.stores.get("commands");

		const { message: long } = fakeMessage("<@123> こっち");
		await commands.dispatchMention(long);
		const { message: short } = fakeMessage("<@12> こっち");
		await commands.dispatchMention(short);

		expect(runs).toEqual(["long", "short"]);
	});

	test("commandRun イベントに type: mention の payload が届く", async () => {
		const { client } = setup(["123"]);
		await client.load();

		const payloads: unknown[] = [];
		client.on(FrameworkEvents.CommandRun, (payload) => payloads.push(payload));

		const { message } = fakeMessage("<@123> ping");
		await client.stores.get("commands").dispatchMention(message);

		expect(payloads).toHaveLength(1);
		const payload = payloads[0] as { type: string; content: string };
		expect(payload.type).toBe("mention");
		expect(payload.content).toBe("ping");
	});

	test("Precondition の拒否は messageRun で判定され、理由が返信される", async () => {
		class NeverPrecondition extends Precondition {
			override messageRun() {
				return this.deny("あなたは使えません。");
			}
		}

		let ran = false;

		@Command.define({ mentions: ["123"], preconditions: ["Never"] })
		class GuardedCommand extends Command {
			override async mentionRun() {
				ran = true;
			}
		}

		const client = createTestClient();
		client.register(NeverPrecondition, GuardedCommand);
		await client.load();

		const { message, replies } = fakeMessage("<@123> やって");
		// 拒否でも「消費した」扱い(プレフィックス解析には回さない)。
		expect(await client.stores.get("commands").dispatchMention(message)).toBe(true);
		expect(ran).toBe(false);
		expect((replies[0] as { content: string }).content).toBe("あなたは使えません。");
	});

	test("mentions 指定ありで mentionRun がなければ起動時に失敗する", async () => {
		@Command.define({ mentions: ["123"] })
		class BrokenCommand extends Command {
			override async chatInputRun() {}
		}

		const client = createTestClient();
		client.register(BrokenCommand);
		await expect(client.load()).rejects.toThrow(/mentionRun がありません/);
	});

	test("同じ対象を2つのコマンドが宣言すると起動時に失敗する", async () => {
		@Command.define({ mentions: ["123"] })
		class OneCommand extends Command {
			override async mentionRun() {}
		}

		@Command.define({ mentions: ["123"] })
		class TwoCommand extends Command {
			override async mentionRun() {}
		}

		const client = createTestClient();
		client.register(OneCommand, TwoCommand);
		await expect(client.load()).rejects.toThrow(/メンション対象 "123" は "one" がすでに/);
	});

	test("空配列・不正な対象は起動時に失敗する", async () => {
		@Command.define({ mentions: [] })
		class EmptyCommand extends Command {
			override async mentionRun() {}
		}

		const empty = createTestClient();
		empty.register(EmptyCommand);
		await expect(empty.load()).rejects.toThrow(/空の配列は指定できません/);

		@Command.define({ mentions: ["not-a-snowflake"] })
		class InvalidCommand extends Command {
			override async mentionRun() {}
		}

		const invalid = createTestClient();
		invalid.register(InvalidCommand);
		await expect(invalid.load()).rejects.toThrow(/メンション対象 "not-a-snowflake" が不正です/);
	});

	test("mentions: false でメンション反応を切れる(プレフィックスは従来どおり)", async () => {
		const runs: string[] = [];

		@Command.define({ mentions: false })
		class QuietCommand extends Command {
			override async mentionRun() {
				runs.push("mention");
			}

			override async messageRun() {
				runs.push("message");
			}
		}

		const client = createTestClient({ defaultPrefix: "!" });
		client.register(QuietCommand);
		await client.load();
		const commands = client.stores.get("commands");
		expect(commands.hasMentionCommands).toBe(false);

		const { message } = fakeMessage("<@123> quiet");
		expect(await commands.dispatchMention(message)).toBe(false);

		const { message: prefixed } = fakeMessage("!quiet");
		await commands.dispatchMessage(prefixed, ["!"]);
		expect(runs).toEqual(["message"]);
	});
});
