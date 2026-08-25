import { describe, expect, test } from "bun:test";
import { Client, type Logger } from "cc-discord-framework";
import { music } from "@cc-discord-framework/music";
import { musicSources } from "../src/index.js";
import { YtdlpError, ytdlpJson } from "../src/youtube/ytdlp.js";
import type { YtdlpConfig } from "../src/config.js";

const silentLogger = { debug: () => {} } as unknown as Logger;

/**
 * bun を偽の yt-dlp として使います。`-e` のスクリプトが本体で、
 * ここでは追加の引数を渡さないので commonArgs だけで完結します。
 */
function bunAs(script: string, timeout: YtdlpConfig["timeout"]): YtdlpConfig {
	return { path: "bun", format: "best", commonArgs: ["-e", script], timeout };
}

describe("yt-dlp のタイムアウト", () => {
	test("timeout を超えるとプロセスを kill して YtdlpError を投げる", async () => {
		const started = Date.now();
		let error: unknown;
		try {
			// 実際の yt-dlp がハングした状況を、眠り続けるプロセスで再現する。
			await ytdlpJson([], bunAs("await Bun.sleep(10_000);", 200), silentLogger);
		} catch (caught) {
			error = caught;
		}

		expect(error).toBeInstanceOf(YtdlpError);
		expect((error as Error).message).toContain("200ms");
		// kill されていれば 10 秒待たずに返ってくる。
		expect(Date.now() - started).toBeLessThan(5_000);
	});

	test("timeout 内に完了すれば普通に結果を返す", async () => {
		const info = await ytdlpJson(
			[],
			bunAs('console.log(JSON.stringify({ id: "ok" }));', 5_000),
			silentLogger,
		);
		expect(info.id).toBe("ok");
	});

	test("timeout: false なら打ち切らない", async () => {
		const info = await ytdlpJson(
			[],
			bunAs('console.log(JSON.stringify({ id: "no-limit" }));', false),
			silentLogger,
		);
		expect(info.id).toBe("no-limit");
	});
});

describe("timeout の設定", () => {
	function createClient(timeout?: number | false) {
		return new Client({
			intents: [],
			baseDirectory: null,
			logger: { level: "silent" },
			plugins: [
				music(),
				musicSources(timeout === undefined ? {} : { youtube: { ytdlp: { timeout } } }),
			],
		});
	}

	test("既定は 30 秒", async () => {
		const client = createClient();
		await client.load();
		expect(client.container.musicSourcesConfig.youtube.ytdlp.timeout).toBe(30_000);
		await client.destroy();
	});

	test("musicSources({ youtube: { ytdlp: { timeout } } }) で上書きできる", async () => {
		const client = createClient(1_234);
		await client.load();
		expect(client.container.musicSourcesConfig.youtube.ytdlp.timeout).toBe(1_234);
		await client.destroy();
	});
});
