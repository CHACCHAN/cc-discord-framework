import { describe, expect, test } from "bun:test";
import { Command, Service } from "../src/index.js";
import { createTestClient } from "./helpers.js";

describe("サービス", () => {
	test("名前は lowerCamelCase で導出される", async () => {
		class GuildSettingsService extends Service {}

		const client = createTestClient();
		client.register(GuildSettingsService);
		await client.load();

		expect(client.stores.get("services").get("guildSettings")).toBeInstanceOf(
			GuildSettingsService,
		);
	});

	test("this.services / container.services で import なしに参照できる", async () => {
		class CounterService extends Service {
			#count = 0;
			public increment(): number {
				return ++this.#count;
			}
		}

		let observed = -1;

		@Command.define({ description: "カウント" })
		class CountCommand extends Command {
			override async chatInputRun() {}
			override onLoad() {
				// サービスストアが最初にロードされるため、他コンポーネントの
				// onLoad からサービスを利用できる。
				const services = this.services as { counter: CounterService };
				observed = services.counter.increment();
			}
		}

		const client = createTestClient();
		client.register(CounterService, CountCommand);
		await client.load();

		expect(observed).toBe(1);
		const services = client.container.services as { counter: CounterService };
		expect(services.counter.increment()).toBe(2);
	});

	test("アンロードでレジストリから取り除かれる", async () => {
		class TempService extends Service {}

		const client = createTestClient();
		client.register(TempService);
		await client.load();

		expect((client.container.services as Record<string, unknown>).temp).toBeDefined();
		await client.stores.get("services").unload("temp");
		expect((client.container.services as Record<string, unknown>).temp).toBeUndefined();
	});

	test("サービスにもライフサイクル(onLoad/onUnload)がある", async () => {
		const calls: string[] = [];

		class DatabaseService extends Service {
			override onLoad() {
				calls.push("open");
			}
			override onUnload() {
				calls.push("close");
			}
		}

		const client = createTestClient();
		client.register(DatabaseService);
		await client.load();
		await client.destroy();

		expect(calls).toEqual(["open", "close"]);
	});
});
