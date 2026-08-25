import { describe, expect, test } from "bun:test";
import { FrameworkEvents, Listener } from "../src/index.js";
import { createTestClient } from "./helpers.js";

describe("リスナー", () => {
	test("宣言したイベントに購読され、引数を受け取る", async () => {
		const received: string[] = [];

		@Listener.define({ event: "warn" })
		class WarnListener extends Listener<"warn"> {
			override run(message: string) {
				received.push(message);
			}
		}

		const client = createTestClient();
		client.register(WarnListener);
		await client.load();

		client.emit("warn", "first");
		client.emit("warn", "second");
		expect(received).toEqual(["first", "second"]);
	});

	test("once リスナーは初回で購読解除される", async () => {
		const received: string[] = [];

		@Listener.define({ event: "warn", once: true })
		class OnceListener extends Listener<"warn"> {
			override run(message: string) {
				received.push(message);
			}
		}

		const client = createTestClient();
		client.register(OnceListener);
		await client.load();

		client.emit("warn", "first");
		client.emit("warn", "second");
		expect(received).toEqual(["first"]);
	});

	test("アンロードで購読が解除される", async () => {
		const received: string[] = [];

		@Listener.define({ event: "warn" })
		class WarnListener extends Listener<"warn"> {
			override run(message: string) {
				received.push(message);
			}
		}

		const client = createTestClient();
		client.register(WarnListener);
		await client.load();
		await client.stores.get("listeners").unload("warn");

		client.emit("warn", "after");
		expect(received).toEqual([]);
	});

	test("イベント未宣言のリスナーはロード時に失敗する", async () => {
		class NoEventListener extends Listener {
			override run() {}
		}

		const client = createTestClient();
		client.register(NoEventListener);
		expect(client.load()).rejects.toThrow(/イベントが宣言されていません/);
	});

	test("リスナー内のエラーは listenerError として発火する", async () => {
		@Listener.define({ event: "warn" })
		class BrokenListener extends Listener<"warn"> {
			override run() {
				throw new Error("listener boom");
			}
		}

		const client = createTestClient();
		client.register(BrokenListener);
		await client.load();

		const errors: unknown[] = [];
		client.on(FrameworkEvents.ListenerError, (error, listener) =>
			errors.push(`${listener.name}:${(error as Error).message}`),
		);

		client.emit("warn", "trigger");
		await Bun.sleep(0);
		expect(errors).toEqual(["broken:listener boom"]);
	});

	test("リスナーはフレームワークイベントも観測できる", async () => {
		const loaded: string[] = [];

		@Listener.define({ event: "componentLoaded" })
		class AuditListener extends Listener<"componentLoaded"> {
			override run(component: { name: string }) {
				loaded.push(component.name);
			}
		}

		@Listener.define({ event: "warn" })
		class WarnListener extends Listener<"warn"> {
			override run() {}
		}

		const client = createTestClient();
		client.register(AuditListener, WarnListener);
		await client.load();

		// AuditListener が先にロードされる(登録順)ため WarnListener を観測できる。
		expect(loaded).toContain("warn");
	});
});
