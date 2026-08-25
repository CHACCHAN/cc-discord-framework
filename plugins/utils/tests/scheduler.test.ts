import { describe, expect, test } from "bun:test";
import { Client, ComponentLoadError, Events } from "@cc-discord-framework/core";
import { Task, utils } from "../src/index.js";

function createClient(options: Parameters<typeof utils>[0] = {}) {
	return new Client({
		intents: [],
		baseDirectory: null,
		logger: { level: "silent" },
		plugins: [utils(options)],
	});
}

/** ready はゲートウェイからしか来ないので、テストでは直接発火させる。 */
function fireReady(client: Client) {
	client.emit(Events.ClientReady, client as never);
}

const tick = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("utils() プラグイン", () => {
	test("tasks ストアを登録する", async () => {
		const client = createClient();
		await client.load();
		expect(client.stores.get("tasks")).toBeDefined();
		await client.destroy();
	});

	test("scheduler: false で登録しない", async () => {
		const client = createClient({ scheduler: false });
		await client.load();
		expect(client.stores.get("tasks")).toBeUndefined();
		await client.destroy();
	});
});

describe("Task", () => {
	test("期間表記をミリ秒へ解決する", async () => {
		@Task.define({ every: "1h30m" })
		class SweepTask extends Task {
			override run() {}
		}

		const client = createClient();
		client.register(SweepTask);
		await client.load();

		expect(client.stores.get("tasks").get("sweep")?.every).toBe(5_400_000);
		await client.destroy();
	});

	test("runOnStart は ready 直後に一度走る", async () => {
		let runs = 0;

		@Task.define({ every: "1h", runOnStart: true })
		class PingTask extends Task {
			override run() {
				runs += 1;
			}
		}

		const client = createClient();
		client.register(PingTask);
		await client.load();

		expect(runs).toBe(0); // ready 前は動かない
		fireReady(client);
		await tick(0);
		expect(runs).toBe(1);

		await client.destroy();
	});

	test("間隔ごとに繰り返し、アンロードで止まる", async () => {
		let runs = 0;

		@Task.define({ every: 20 })
		class BeatTask extends Task {
			override run() {
				runs += 1;
			}
		}

		const client = createClient();
		client.register(BeatTask);
		await client.load();
		fireReady(client);

		await tick(70);
		expect(runs).toBeGreaterThanOrEqual(2);

		await client.stores.get("tasks").unload("beat");
		const stopped = runs;
		await tick(70);
		expect(runs).toBe(stopped);

		await client.destroy();
	});

	test("run() の例外はスケジュールを止めない", async () => {
		let runs = 0;

		@Task.define({ every: 20 })
		class FlakyTask extends Task {
			override run() {
				runs += 1;
				throw new Error("失敗");
			}
		}

		const client = createClient();
		client.register(FlakyTask);
		await client.load();
		fireReady(client);

		await tick(70);
		expect(runs).toBeGreaterThanOrEqual(2);
		await client.destroy();
	});

	test("不正な every はロード時に落とす", async () => {
		@Task.define({ every: "まいにち" })
		class BadTask extends Task {
			override run() {}
		}

		const client = createClient();
		client.register(BadTask);
		await expect(client.load()).rejects.toThrow(ComponentLoadError);
	});

	test("0 以下の every もロード時に落とす", async () => {
		@Task.define({ every: 0 })
		class ZeroTask extends Task {
			override run() {}
		}

		const client = createClient();
		client.register(ZeroTask);
		await expect(client.load()).rejects.toThrow(ComponentLoadError);
	});
});

describe("Task: 間隔の上限", () => {
	test("2^31-1 ミリ秒を超える every はロード時に落とし、上限をメッセージで伝える", async () => {
		// "30d" = 2,592,000,000ms — setInterval の 32bit 遅延を超える。
		@Task.define({ every: "30d" })
		class MonthlyTask extends Task {
			override run() {}
		}

		const client = createClient();
		client.register(MonthlyTask);

		const error = await client.load().then(
			() => null,
			(thrown) => thrown as Error,
		);
		expect(error).toBeInstanceOf(ComponentLoadError);
		expect(error?.message).toContain("上限");
		expect(error?.message).toContain("2147483647");
	});

	test("上限ちょうど(2^31-1 ミリ秒)は許される", async () => {
		@Task.define({ every: 2 ** 31 - 1 })
		class EdgeTask extends Task {
			override run() {}
		}

		const client = createClient();
		client.register(EdgeTask);
		await client.load();

		expect(client.stores.get("tasks").get("edge")?.every).toBe(2 ** 31 - 1);
		await client.destroy();
	});
});

describe("Task: 重ね実行(overlap)", () => {
	test("既定では前回の run() が終わるまで次の周期をスキップする", async () => {
		let starts = 0;
		let release!: () => void;
		const gate = new Promise<void>((resolve) => {
			release = resolve;
		});

		@Task.define({ every: 20 })
		class SlowTask extends Task {
			override async run() {
				starts += 1;
				await gate;
			}
		}

		const client = createClient();
		client.register(SlowTask);
		await client.load();

		expect(client.stores.get("tasks").get("slow")?.overlap).toBe(false);

		fireReady(client);
		await tick(90); // 周期は何度も来るが、最初の run() がまだ終わっていない
		expect(starts).toBe(1);

		release(); // 終わらせると、次の周期から再開する
		await tick(60);
		expect(starts).toBeGreaterThanOrEqual(2);

		await client.destroy();
	});

	test("overlap: true なら実行中でも次の周期を重ねる", async () => {
		let starts = 0;
		let release!: () => void;
		const gate = new Promise<void>((resolve) => {
			release = resolve;
		});

		@Task.define({ every: 20, overlap: true })
		class ConcurrentTask extends Task {
			override async run() {
				starts += 1;
				await gate;
			}
		}

		const client = createClient();
		client.register(ConcurrentTask);
		await client.load();

		expect(client.stores.get("tasks").get("concurrent")?.overlap).toBe(true);

		fireReady(client);
		await tick(90); // 1回も終わっていないのに、周期ごとに重ねて始まる
		expect(starts).toBeGreaterThanOrEqual(2);

		release(); // 積んだ run() を終わらせてから片付ける
		await client.destroy();
	});
});
