import { beforeEach, describe, expect, test } from "bun:test";
import { dirname, join, resolve } from "node:path";
import {
	Client,
	ConfigLoadError,
	createClient,
	GatewayIntentBits,
	IntentsBitField,
	loadClientConfig,
	Partials,
} from "../src/index.js";
import { installed } from "./fixtures/marker-plugin.js";
import type { JobStore } from "./fixtures/job-kind.js";

const FIXTURES = join(import.meta.dir, "fixtures");
const CONFIG = join(FIXTURES, "config");
const CONFIG_APP = join(FIXTURES, "config-app");
const FIXTURE_BOT = join(FIXTURES, "bot");

/** 例外を値として受け取る(メッセージまで検査したいので toThrow は使わない)。 */
async function capture(run: () => Promise<unknown>): Promise<unknown> {
	try {
		await run();
		return null;
	} catch (error) {
		return error;
	}
}

beforeEach(() => {
	installed.length = 0;
});

describe("設定ディレクトリの読み込み", () => {
	test("複数のファイルが1つの ClientOptions にまとまる", async () => {
		const options = await loadClientConfig(CONFIG);

		expect(options.defaultPrefix).toBe("!");
		expect(options.syncApplicationCommands).toBe(false);
		expect(options.plugins).toBeDefined();
		expect(new IntentsBitField(options.intents).has(GatewayIntentBits.Guilds)).toBe(true);
	});

	test("plugins は priority の降順 → パスの昇順に連結される", async () => {
		const options = await loadClientConfig(CONFIG);

		// z-first.ts は priority 10 なので、ファイル名が最後でも先頭に来る。
		// 続く3ファイルは priority 0 なのでパスの昇順:
		// a-base.ts → b-extra.ts → nested/late.ts。
		expect(options.plugins?.map((plugin) => plugin.name)).toEqual([
			"first",
			"base-1",
			"base-2",
			"extra",
			"nested",
		]);
	});

	test("1つのファイル内に並べたプラグインは配列順を保つ", async () => {
		const options = await loadClientConfig(CONFIG);
		const names = options.plugins?.map((plugin) => plugin.name) ?? [];

		expect(names.indexOf("base-1")).toBeLessThan(names.indexOf("base-2"));
		// 連結なので、同じファイルのプラグインの間に他ファイルのものは挟まらない。
		expect(names.indexOf("base-2") - names.indexOf("base-1")).toBe(1);
	});

	test("intents は合併される(重複は除かれる)", async () => {
		const options = await loadClientConfig(CONFIG);
		const intents = new IntentsBitField(options.intents);

		// a-base.ts: Guilds / b-extra.ts: Guilds + GuildMessages /
		// z-first.ts: MessageContent(配列以外の表記)。
		expect([...intents.toArray()].sort()).toEqual([
			"GuildMessages",
			"Guilds",
			"MessageContent",
		]);
	});

	test("partials と applicationGuildIds は合併される", async () => {
		const options = await loadClientConfig(CONFIG);

		expect([...(options.partials ?? [])].sort()).toEqual(
			[Partials.Message, Partials.Channel].sort(),
		);
		expect([...(options.applicationGuildIds ?? [])].sort()).toEqual(["100", "200", "300"]);
	});

	test("1つのファイルだけが書いたキーはそのまま採用される", async () => {
		const options = await loadClientConfig(CONFIG);

		// defaultPrefix は a-base.ts のみ、syncApplicationCommands は b-extra.ts のみ。
		expect(options.defaultPrefix).toBe("!");
		expect(options.syncApplicationCommands).toBe(false);
	});

	test("priority は結果の ClientOptions に残らない", async () => {
		const options = await loadClientConfig(CONFIG);

		expect(Object.hasOwn(options, "priority")).toBe(false);
		expect((options as unknown as Record<string, unknown>).priority).toBeUndefined();
	});

	test("サブディレクトリの設定ファイルも読み込まれる", async () => {
		const options = await loadClientConfig(CONFIG);

		// config/nested/late.ts が寄与したプラグイン。
		expect(options.plugins?.map((plugin) => plugin.name)).toContain("nested");
	});

	test('"_" 始まりのファイルは設定として読み込まれない', async () => {
		const options = await loadClientConfig(CONFIG);

		// config/_env.ts の default export は無視される。
		expect(options.applicationGuildIds).not.toContain("_SHOULD_NOT_LOAD");
		// 一方で共有コードとしては使える(a-base.ts が import している)。
		expect(options.applicationGuildIds).toContain("100");
		expect(options.applicationGuildIds).toContain("200");
	});

	test("URL でも設定ディレクトリを渡せる", async () => {
		const options = await loadClientConfig(Bun.pathToFileURL(CONFIG));

		expect(options.defaultPrefix).toBe("!");
	});
});

describe("設定の衝突と検証", () => {
	test("同じキーに違う値を書いた2ファイルはエラーになる", async () => {
		const directory = join(FIXTURES, "config-conflict");
		const error = await capture(() => loadClientConfig(directory));

		expect(error).toBeInstanceOf(ConfigLoadError);
		const message = (error as Error).message;
		expect(message).toContain('"defaultPrefix"');
		expect(message).toContain(join(directory, "alpha.ts"));
		expect(message).toContain(join(directory, "beta.ts"));
	});

	test("default export のないファイルはファイル名付きでエラーになる", async () => {
		const directory = join(FIXTURES, "config-no-default");
		const error = await capture(() => loadClientConfig(directory));

		expect(error).toBeInstanceOf(ConfigLoadError);
		expect((error as Error).message).toContain(join(directory, "broken.ts"));
		expect((error as Error).message).toContain("default export");
		// "_" 始まりに逃がすという回避策も示す。
		expect((error as Error).message).toContain("_env.ts");
		expect((error as ConfigLoadError).path).toBe(join(directory, "broken.ts"));
	});

	test("intents がどこにもなければエラーになる", async () => {
		const directory = join(FIXTURES, "config-no-intents");
		const error = await capture(() => loadClientConfig(directory));

		expect(error).toBeInstanceOf(ConfigLoadError);
		expect((error as Error).message).toContain("intents");
		// 読み込んだファイルを列挙するので、どこに書けばよいか分かる。
		expect((error as Error).message).toContain(join(directory, "prefix.ts"));
	});

	test("applicationGuildIds は配列でなければエラーになる(文字列が砕けない)", async () => {
		const error = await capture(() => loadClientConfig(join(FIXTURES, "config-bad-guilds")));

		expect(error).toBeInstanceOf(ConfigLoadError);
		expect((error as Error).message).toContain("applicationGuildIds");
		expect((error as Error).message).toContain("配列");
	});

	test("partials は配列でなければエラーになる(素の TypeError にしない)", async () => {
		const error = await capture(() => loadClientConfig(join(FIXTURES, "config-bad-partials")));

		expect(error).toBeInstanceOf(ConfigLoadError);
		expect((error as Error).message).toContain("partials");
	});

	test("priority が NaN ならエラーになる(ソートを黙って壊さない)", async () => {
		const error = await capture(() => loadClientConfig(join(FIXTURES, "config-nan-priority")));

		expect(error).toBeInstanceOf(ConfigLoadError);
		expect((error as Error).message).toContain("priority");
	});

	test("クラスインスタンスの default export はエラーになる(getter が黙って落ちない)", async () => {
		const error = await capture(() => loadClientConfig(join(FIXTURES, "config-class")));

		expect(error).toBeInstanceOf(ConfigLoadError);
		expect((error as Error).message).toContain("default export");
	});

	test("intents の合併結果が空ならエラーになる", async () => {
		const error = await capture(() => loadClientConfig(join(FIXTURES, "config-empty-intents")));

		expect(error).toBeInstanceOf(ConfigLoadError);
		expect((error as Error).message).toContain("intents");
	});

	test("存在しないディレクトリは試したパスを挙げてエラーになる", async () => {
		const directory = join(FIXTURES, "config-does-not-exist");
		const error = await capture(() => loadClientConfig(directory));

		expect(error).toBeInstanceOf(ConfigLoadError);
		expect((error as Error).message).toContain(directory);
		expect((error as ConfigLoadError).path).toBe(directory);
	});

	// 既定の解決先は `Bun.main` に依存するので、**別プロセスで実際に
	// エントリポイントとして走らせて** 確かめます。このテストファイル自身を
	// エントリとして当てにすると、リポジトリ直下に config/ が生えた日に
	// テストの意味が変わってしまいます。
	test("ディレクトリを省略するとエントリポイントと同じ場所の config/ を読む", async () => {
		const root = join(FIXTURES, "default-config");
		const result = await runEntry(join(root, "src", "entry.ts"));

		// src/config/ の設定が届いている(Guilds 1 | GuildVoiceStates 128)。
		expect(result.intents).toBe("129");
		// baseDirectory はエントリのある場所(src/config/ はその中にある)。
		expect(result.baseDirectory).toBe(join(root, "src"));
	});

	test("config/ が無ければ、試したパスを挙げて失敗する", async () => {
		const root = join(FIXTURES, "no-config");
		const result = await runEntry(join(root, "src", "entry.ts"));

		expect(result.message).toContain(join(root, "src", "config"));
	});
});

/** フィクスチャのエントリポイントを別プロセスで走らせ、標準出力の JSON を返します。 */
async function runEntry(entry: string): Promise<Record<string, string>> {
	const proc = Bun.spawn(["bun", "run", entry], { stdout: "pipe", stderr: "pipe" });
	const [out, err, code] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
		proc.exited,
	]);
	if (code !== 0) throw new Error(`${entry} が異常終了しました (${code}):\n${err}`);
	return JSON.parse(out.trim()) as Record<string, string>;
}

describe("createClient", () => {
	test("設定ディレクトリから動くクライアントができる", async () => {
		const client = await createClient(CONFIG_APP);

		expect(client).toBeInstanceOf(Client);
		// config/ の場所とは無関係に、baseDirectory は設定どおり bot フィクスチャ。
		expect(client.baseDirectory).toBe(FIXTURE_BOT);

		await client.load();

		// priority 5 の plugins.ts が先(ファイル名は client.ts の方が先)。
		// ファイル内の並びも保たれる。
		expect(installed).toEqual(["app-first", "app-second", "app-last"]);

		// baseDirectory 由来のコンポーネント自動探索は変わらず動く。
		expect(client.stores.get("commands").get("ping")).toBeDefined();
		expect(client.stores.get("listeners").get("warn")).toBeDefined();
		expect(client.stores.get("services").get("counter")).toBeDefined();
		expect((client.stores.get("jobs") as JobStore).get("cleanup")).toBeDefined();
	});

	test("baseDirectory を書かない設定では Bun.main の隣のままになる", async () => {
		const client = await createClient(CONFIG);

		// 設定ディレクトリ(fixtures/config)ではなく、エントリポイントの
		// ディレクトリ — 設定の読み込みは baseDirectory に影響しない。
		expect(client.baseDirectory).toBe(dirname(Bun.main));
		expect(client.baseDirectory).not.toBe(CONFIG);
	});

	test("overrides はファイルの内容より優先される", async () => {
		const client = await createClient(CONFIG_APP, {
			// client.ts はどちらも別の値を書いている。
			baseDirectory: null,
			logger: { level: "warn" },
		});

		expect(client.baseDirectory).toBeNull();
		expect(client.logger.level).toBe("warn");

		await client.load();
		// baseDirectory を無効化したので自動探索は走らない。
		expect(client.stores.get("commands").size).toBe(0);
	});
});
