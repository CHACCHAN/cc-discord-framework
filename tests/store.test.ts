import { describe, expect, test } from "bun:test";
import {
	Command,
	Component,
	ComponentLoadError,
	ComponentStore,
	defineOptions,
	FrameworkEvents,
	Precondition,
	type ComponentOptions,
} from "../src/index.js";
import { createTestClient } from "./helpers.js";

describe("コンポーネントストア", () => {
	test("明示登録で名前が導出されてロードされる", async () => {
		@Command.define({ description: "Pong!" })
		class PingCommand extends Command {
			override async chatInputRun() {}
		}
		@Command.define({ description: "ユーザー情報" })
		class UserInfoCommand extends Command {
			override async chatInputRun() {}
		}

		const client = createTestClient();
		client.register(PingCommand, UserInfoCommand);
		await client.load();

		const commands = client.stores.get("commands");
		expect(commands.get("ping")).toBeInstanceOf(PingCommand);
		expect(commands.get("user-info")).toBeInstanceOf(UserInfoCommand);
	});

	test("suffix でディレクトリ名とクラス名の語のずれを吸収できる", async () => {
		abstract class Widget extends Component {
			public static define(options: ComponentOptions = {}) {
				return defineOptions<Widget>(options);
			}
		}
		class WidgetStore extends ComponentStore<Widget> {
			public constructor() {
				// ストア(= ディレクトリ)名は "panel" だが、接尾辞は "Widget"。
				super({ name: "panel", base: Widget, suffix: "Widget" });
			}
		}

		@Widget.define()
		class NowPlayingWidget extends Widget {}

		const client = createTestClient();
		client.stores.register(new WidgetStore());
		client.register(NowPlayingWidget);
		await client.load();

		const panel = client.stores.get("panel");
		expect(panel?.get("now-playing")).toBeInstanceOf(NowPlayingWidget);
		// 既定(ストア名の単数形)なら "Panel" を探すので、剥がれずに残っていたはず。
		expect(panel?.get("now-playing-widget")).toBeUndefined();
	});

	test("onLoad() の中で同じストアへ register() しても取り残されない", async () => {
		// loadAll() がキューを1回しか読まないと、ロード中に積まれた分が
		// 誰にも読まれず黙って消える(エラーもログも無し)。
		const loaded: string[] = [];

		@Command.define({ description: "後から登録される" })
		class LateCommand extends Command {
			override onLoad(): void {
				loaded.push(this.name);
			}
			override async chatInputRun() {}
		}

		@Command.define({ description: "ロード中に別のコマンドを登録する" })
		class EagerCommand extends Command {
			override onLoad(): void {
				loaded.push(this.name);
				this.container.client.register(LateCommand);
			}
			override async chatInputRun() {}
		}

		const client = createTestClient();
		client.register(EagerCommand);
		await client.load();

		expect(loaded).toEqual(["eager", "late"]);
		expect(client.stores.get("commands").get("late")).toBeInstanceOf(LateCommand);
		await client.destroy();
	});

	test("Precondition 名は大文字小文字を保持する", async () => {
		class OwnerOnlyPrecondition extends Precondition {
			override chatInputRun() {
				return this.ok();
			}
		}

		const client = createTestClient();
		client.register(OwnerOnlyPrecondition);
		await client.load();

		expect(client.stores.get("preconditions").get("OwnerOnly")).toBeInstanceOf(
			OwnerOnlyPrecondition,
		);
	});

	test("デコレータで明示した name が導出より優先される", async () => {
		@Command.define({ name: "pong", description: "Pong!" })
		class PingCommand extends Command {
			override async chatInputRun() {}
		}

		const client = createTestClient();
		client.register(PingCommand);
		await client.load();

		expect(client.stores.get("commands").get("pong")).toBeDefined();
		expect(client.stores.get("commands").get("ping")).toBeUndefined();
	});

	test("サブクラスが親の name を引き継ぐことはない", async () => {
		@Command.define({ name: "parent", description: "親" })
		class ParentCommand extends Command {
			override async chatInputRun() {}
		}
		@Command.define({ description: "子" })
		class SpecialCommand extends ParentCommand {}

		const client = createTestClient();
		client.register(ParentCommand, SpecialCommand);
		await client.load();

		const commands = client.stores.get("commands");
		expect(commands.get("parent")).toBeInstanceOf(ParentCommand);
		expect(commands.get("special")).toBeInstanceOf(SpecialCommand);
	});

	test("異なるクラス同士の名前重複は即座に失敗する", async () => {
		@Command.define({ name: "ping", description: "その1" })
		class OneCommand extends Command {
			override async chatInputRun() {}
		}
		@Command.define({ name: "ping", description: "その2" })
		class TwoCommand extends Command {
			override async chatInputRun() {}
		}

		const client = createTestClient();
		client.register(OneCommand, TwoCommand);
		expect(client.load()).rejects.toThrow(ComponentLoadError);
	});

	test("同じクラスの二重ロードは冪等", async () => {
		@Command.define({ description: "Pong!" })
		class PingCommand extends Command {
			override async chatInputRun() {}
		}

		const client = createTestClient();
		await client.load();
		const commands = client.stores.get("commands");
		const first = await commands.load(PingCommand);
		const second = await commands.load(PingCommand);
		expect(first).toBe(second);
		expect(commands.size).toBe(1);
	});

	test("説明のないスラッシュコマンドはロード時に失敗する", async () => {
		class BareCommand extends Command {
			override async chatInputRun() {}
		}

		const client = createTestClient();
		client.register(BareCommand);
		expect(client.load()).rejects.toThrow(/説明/);
	});

	test("メッセージ専用コマンドに説明は不要", async () => {
		class HelloCommand extends Command {
			override async messageRun() {}
		}

		const client = createTestClient();
		client.register(HelloCommand);
		await client.load();
		expect(client.stores.get("commands").get("hello")).toBeDefined();
	});

	test("onLoad/onUnload が実行され、destroy で全アンロードされる", async () => {
		const calls: string[] = [];

		@Command.define({ description: "Pong!" })
		class PingCommand extends Command {
			override async chatInputRun() {}
			override onLoad() {
				calls.push(`load:${this.name}`);
			}
			override onUnload() {
				calls.push(`unload:${this.name}`);
			}
		}

		const client = createTestClient();
		client.register(PingCommand);
		await client.load();
		expect(calls).toEqual(["load:ping"]);

		await client.destroy();
		expect(calls).toEqual(["load:ping", "unload:ping"]);
		expect(client.stores.get("commands").size).toBe(0);
	});

	test("componentLoaded/componentUnloaded イベントが発火する", async () => {
		const seen: string[] = [];

		@Command.define({ description: "Pong!" })
		class PingCommand extends Command {
			override async chatInputRun() {}
		}

		const client = createTestClient();
		client.on(FrameworkEvents.ComponentLoaded, (component) =>
			seen.push(`loaded:${component.name}`),
		);
		client.on(FrameworkEvents.ComponentUnloaded, (component) =>
			seen.push(`unloaded:${component.name}`),
		);
		client.register(PingCommand);
		await client.load();
		await client.stores.get("commands").unload("ping");

		expect(seen).toEqual(["loaded:ping", "unloaded:ping"]);
	});

	test("コンポーネントは container / store / logger を持って初期化される", async () => {
		let checked = false;

		@Command.define({ description: "Pong!" })
		class PingCommand extends Command {
			override onLoad() {
				expect(this.container.client).toBe(this.client);
				expect(this.store.name).toBe("commands");
				expect(typeof this.logger.info).toBe("function");
				checked = true;
			}
			override async chatInputRun() {}
		}

		const client = createTestClient();
		client.register(PingCommand);
		await client.load();
		expect(checked).toBe(true);
	});

	test("別名の衝突は即座に失敗し、コンポーネントはロールバックされる", async () => {
		@Command.define({ description: "Say", aliases: ["s"] })
		class SayCommand extends Command {
			override async messageRun() {}
		}
		@Command.define({ description: "Speak", aliases: ["say"] })
		class SpeakCommand extends Command {
			override async messageRun() {}
		}

		const client = createTestClient();
		client.register(SayCommand, SpeakCommand);
		expect(client.load()).rejects.toThrow(/"say" がすでに使用しています/);
	});

	test("bind 失敗時は unbind と onUnload で onLoad の副作用を巻き戻す", async () => {
		const calls: string[] = [];

		abstract class Widget extends Component {
			public static define(options: ComponentOptions = {}) {
				return defineOptions<Widget>(options);
			}
		}

		class FailingWidgetStore extends ComponentStore<Widget> {
			public constructor() {
				super({ name: "widgets", base: Widget });
			}

			protected override bind(): void {
				calls.push("bind");
				throw new Error("bind boom");
			}

			protected override unbind(): void {
				calls.push("unbind");
			}
		}

		@Widget.define()
		class TimerWidget extends Widget {
			override onLoad(): void {
				calls.push("load");
			}

			override onUnload(): void {
				calls.push("unload");
			}
		}

		const client = createTestClient();
		const store = new FailingWidgetStore();
		client.stores.register(store);
		client.register(TimerWidget);

		expect(client.load()).rejects.toThrow("bind boom");
		expect(calls).toEqual(["load", "bind", "unbind", "unload"]);
		expect(store.size).toBe(0);
		await client.destroy();
	});

	test("どの種別でもないクラスはロード時に拒否される", async () => {
		class Unrelated {}
		const client = createTestClient();
		client.register(Unrelated as never);
		expect(client.load()).rejects.toThrow(/受け入れるストアがありません/);
	});
});
