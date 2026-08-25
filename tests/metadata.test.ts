import { describe, expect, test } from "bun:test";
import { Command, Component, Listener, defineOptions } from "../src/index.js";
import { getComponentOptions, getOwnComponentOptions } from "../src/component/metadata.js";

describe("デコレータメタデータ", () => {
	test("define で宣言したオプションをクラスから読み出せる", () => {
		@Command.define({ description: "Pong!", aliases: ["p"] })
		class PingCommand extends Command {}

		expect(getComponentOptions(PingCommand)).toEqual({
			description: "Pong!",
			aliases: ["p"],
		});
	});

	test("オプションは基底クラスから継承され、具象側のフィールドが勝つ", () => {
		@Command.define({ description: "base", preconditions: ["OwnerOnly"] })
		abstract class OwnerCommand extends Command {}

		@Command.define({ description: "leaf" })
		class ShutdownCommand extends OwnerCommand {}

		expect(getComponentOptions(ShutdownCommand)).toEqual({
			description: "leaf",
			preconditions: ["OwnerOnly"],
		});
	});

	test("own オプションには継承分が含まれない", () => {
		@Command.define({ name: "parent" })
		class ParentCommand extends Command {}
		class ChildCommand extends ParentCommand {}

		expect(getOwnComponentOptions(ParentCommand)?.name).toBe("parent");
		expect(getOwnComponentOptions(ChildCommand)).toBeUndefined();
		// マージ済みオプションとしては継承される。
		expect(getComponentOptions(ChildCommand).name).toBe("parent");
	});

	test("同一クラスの複数デコレータはマージされる", () => {
		@Command.define({ description: "first" })
		@defineOptions<Command>({ aliases: ["x"] })
		class MergedCommand extends Command {}

		expect(getComponentOptions(MergedCommand)).toEqual({
			description: "first",
			aliases: ["x"],
		});
	});

	test("デコレータのないクラスはオプションを持たない", () => {
		class BareCommand extends Command {}
		expect(getComponentOptions(BareCommand)).toEqual({});
		expect(getOwnComponentOptions(BareCommand)).toBeUndefined();
	});
});

describe("デコレータの型安全性(コンパイル時)", () => {
	test("Listener.define のイベントはクラスのジェネリクスと一致しなければならない", () => {
		@Listener.define({ event: "messageCreate" })
		class _Ok extends Listener<"messageCreate"> {
			override run() {}
		}

		// @ts-expect-error — デコレータとジェネリクスのイベント不一致
		@Listener.define({ event: "messageCreate" })
		class _Mismatch extends Listener<"clientReady"> {
			override run() {}
		}

		// @ts-expect-error — Command のデコレータは素の Component には付けられない
		@Command.define({ description: "nope" })
		class _NotACommand extends Component {}

		expect(true).toBe(true);
	});
});
