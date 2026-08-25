import { describe, expect, test } from "bun:test";
import { join, relative } from "node:path";
import { ComponentLoadError, Service } from "../src/index.js";
import { createTestClient } from "./helpers.js";
import { jobPlugin, JobStore } from "./fixtures/job-kind.js";

const FIXTURE_BOT = join(import.meta.dir, "fixtures", "bot");

describe("ファイル自動探索", () => {
	test("<baseDirectory>/<ストア名> からコンポーネントをロードする", async () => {
		const client = createTestClient({ baseDirectory: FIXTURE_BOT });
		await client.load();

		expect(client.stores.get("commands").get("ping")).toBeDefined();
		expect(client.stores.get("listeners").get("warn")).toBeDefined();
		expect(client.stores.get("preconditions").get("OwnerOnly")).toBeDefined();
		expect(client.stores.get("services").get("counter")).toBeDefined();
	});

	test("相対 baseDirectory は cwd 基準の絶対パスとして探索する", async () => {
		const client = createTestClient({
			baseDirectory: relative(process.cwd(), FIXTURE_BOT),
		});

		expect(client.baseDirectory).toBe(FIXTURE_BOT);
		await client.load();
		expect(client.stores.get("commands").get("ping")).toBeDefined();
	});

	test("自動探索したコンポーネントの onLoad 例外に名前とパスを付ける", async () => {
		const baseDirectory = join(import.meta.dir, "fixtures", "broken-on-load");
		const expectedPath = join(baseDirectory, "commands", "BrokenCommand.ts");
		const client = createTestClient({ baseDirectory });

		let caught: unknown;
		try {
			await client.load();
		} catch (error) {
			caught = error;
		}

		expect(caught).toBeInstanceOf(ComponentLoadError);
		expect((caught as ComponentLoadError).message).toContain('commands コンポーネント "broken"');
		expect((caught as ComponentLoadError).path).toBe(expectedPath);
		expect((caught as Error).cause).toBeInstanceOf(Error);
		expect(((caught as Error).cause as Error).message).toBe("onLoad boom");
		await client.destroy();
	});

	test("アンダースコア始まりのファイル・ディレクトリと無関係な export はスキップされる", async () => {
		const client = createTestClient({ baseDirectory: FIXTURE_BOT });
		await client.load();

		const commands = client.stores.get("commands");
		expect(commands.get("skipped")).toBeUndefined();
		// commands/_hidden/HiddenCommand.ts — ディレクトリ側の "_" も効く。
		expect(commands.get("hidden")).toBeUndefined();
		expect([...commands.keys()].sort()).toEqual(["nested", "ping"]);
	});

	test("サブディレクトリも走査され、名前はクラス名から決まる", async () => {
		const client = createTestClient({ baseDirectory: FIXTURE_BOT });
		await client.load();

		// commands/group/NestedCommand.ts — ディレクトリ名は名前に混ざらない。
		const nested = client.stores.get("commands").get("nested");
		expect(nested).toBeDefined();
		expect(nested?.location).toContain("group");
	});

	test("自動探索されたリスナーは実際に動作する", async () => {
		const { warnings } = await import("./fixtures/bot/listeners/WarnListener.js");
		warnings.length = 0;

		const client = createTestClient({ baseDirectory: FIXTURE_BOT });
		await client.load();
		client.emit("warn", "from-discovery");
		expect(warnings).toEqual(["from-discovery"]);
	});

	test("存在しない種別ディレクトリは問題にならない", async () => {
		const client = createTestClient({
			baseDirectory: join(import.meta.dir, "fixtures", "does-not-exist"),
		});
		await client.load();
		expect(client.stores.get("commands").size).toBe(0);
	});
});

describe("プラグインによるカスタムコンポーネント種別", () => {
	test("プラグインが追加した種別のディレクトリも自動探索される", async () => {
		const { cleanups } = await import("./fixtures/bot/jobs/CleanupJob.js");
		cleanups.length = 0;

		const client = createTestClient({
			baseDirectory: FIXTURE_BOT,
			plugins: [jobPlugin()],
		});
		await client.load();

		const jobs = client.stores.get("jobs") as JobStore;
		expect(jobs.get("cleanup")).toBeDefined();
		expect(jobs.get("cleanup")?.intervalMs).toBe(1000);

		await jobs.runAll();
		expect(cleanups).toEqual([1000]);
	});

	test("プラグインのストアがライフサイクルに参加する", async () => {
		const { Job } = await import("./fixtures/job-kind.js");

		const results: number[] = [];

		@Job.define({ intervalMs: 5 })
		class InlineJob extends Job {
			override run() {
				results.push(this.intervalMs);
			}
		}

		const client = createTestClient({ plugins: [jobPlugin()] });
		// プラグインの install 前でも register できる(load 時に解決される)。
		client.register(InlineJob);
		await client.load();

		const jobs = client.stores.get("jobs") as JobStore;
		expect(jobs).toBeInstanceOf(JobStore);
		expect(jobs.get("inline")).toBeDefined();

		await jobs.runAll();
		expect(results).toEqual([5]);
	});

	test("プラグインの register() は何番目からでも install 順どおりにロードされる", async () => {
		// 以前は `#loading` の代入前に最初の install が走るため、**最初の
		// プラグインの register() だけ** がキューへ回り、他より後にロード
		// されていた(= プラグインの並び順で暗黙にサービスの順序が変わる)。
		const servicePlugin = (name: string, order: string[]) => {
			@Service.define({ name })
			class Recorded extends Service {
				override onLoad(): void {
					order.push(this.name);
				}
			}
			return {
				name: `plugin-${name}`,
				install: (client: { register: (cls: never) => unknown }) =>
					void client.register(Recorded as never),
			};
		};

		for (const names of [
			["alpha", "beta"],
			["beta", "alpha"],
		]) {
			const order: string[] = [];
			const client = createTestClient({
				plugins: names.map((name) => servicePlugin(name, order)),
			});
			await client.load();
			expect(order).toEqual(names);
			await client.destroy();
		}
	});

	test("プラグインは配列順に、コンポーネントのロード前にインストールされる", async () => {
		const order: string[] = [];
		const client = createTestClient({
			plugins: [
				{ name: "first", install: () => void order.push("first") },
				{ name: "second", install: () => void order.push("second") },
			],
		});
		client.on("componentLoaded", () => order.push("component"));
		await client.load();
		expect(order).toEqual(["first", "second"]);
	});
});
