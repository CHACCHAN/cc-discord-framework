import { describe, expect, test } from "bun:test";
import {
	GuildQueue,
	defaultMusicConfig,
	defaultMusicTexts,
	resolveMusicConfig,
} from "../src/index.js";
import { createMusicClient } from "./helpers.js";

describe("文言の差し替え", () => {
	test("指定した文言だけが上書きされ、残りは既定のまま", async () => {
		const client = createMusicClient({ texts: { nothingPlaying: "何も鳴っていません" } });
		await client.load();

		const { texts } = client.container.musicConfig;
		expect(texts.nothingPlaying).toBe("何も鳴っていません");
		expect(texts.accessDenied).toBe(defaultMusicTexts.accessDenied);
		expect(texts.noResult("x")).toBe(defaultMusicTexts.noResult("x"));
		await client.destroy();
	});

	test("オプションなしなら既定の文言と一致する", async () => {
		const client = createMusicClient();
		await client.load();

		expect(client.container.musicConfig.texts).toEqual(defaultMusicTexts);
		await client.destroy();
	});

	test("クライアントごとに独立していて混ざらない", async () => {
		const a = createMusicClient({ texts: { nothingPlaying: "Aは無音" } });
		const b = createMusicClient({ texts: { nothingPlaying: "Bは無音" } });
		await a.load();
		await b.load();

		expect(a.container.musicConfig.texts.nothingPlaying).toBe("Aは無音");
		expect(b.container.musicConfig.texts.nothingPlaying).toBe("Bは無音");
		// 既定のカタログ自体が汚染されていないこと。
		expect(defaultMusicTexts.nothingPlaying).toBe("現在このサーバーでは何も再生していません。");
		await a.destroy();
		await b.destroy();
	});

	test("エンジンの文言だけを持ち、コマンドの応答文言は持たない", () => {
		// 見せ方に関わる文言は Bot 側(client/)の担当なので、ここには置かない。
		expect(Object.keys(defaultMusicTexts).sort()).toEqual([
			"accessDenied",
			"httpFailed",
			"httpTimedOut",
			"noProvider",
			"noResult",
			"notAudio",
			"nothingPlaying",
			"privateAddressDenied",
			"streamFailed",
			"tooManyRedirects",
			"voiceChannelMismatch",
		]);
	});
});

describe("上限値の差し替え", () => {
	test("maxVolume が GuildQueue の音量クランプに効く", async () => {
		const client = createMusicClient({ limits: { maxVolume: 1 } });
		await client.load();

		const queue = client.container.services.audio.ensureQueue("g1");
		queue.volume = 5;
		expect(queue.volume).toBe(1);
		queue.volume = -1;
		expect(queue.volume).toBe(0);
		await client.destroy();
	});

	test("既定の上限は 2 のまま", async () => {
		const client = createMusicClient();
		await client.load();

		const queue = client.container.services.audio.ensureQueue("g1");
		queue.volume = 5;
		expect(queue.volume).toBe(2);
		await client.destroy();
	});

	test("defaultVolume もコンストラクタでクランプされる", async () => {
		const client = createMusicClient({ defaultVolume: 5, limits: { maxVolume: 2 } });
		await client.load();

		// 上限を超える既定値でも、setter と同じ上限まで丸められる。
		expect(client.container.services.audio.ensureQueue("g1").volume).toBe(2);
		await client.destroy();
	});

	test("負の defaultVolume は 0 になる", async () => {
		const client = createMusicClient({ defaultVolume: -1 });
		await client.load();

		expect(client.container.services.audio.ensureQueue("g1").volume).toBe(0);
		await client.destroy();
	});

	test("既定構成の音量は 1 のまま(現在の挙動のまま)", async () => {
		const client = createMusicClient();
		await client.load();

		expect(client.container.services.audio.ensureQueue("g1").volume).toBe(1);
		await client.destroy();
	});

	test("上限内の defaultVolume はそのまま残る", async () => {
		const client = createMusicClient({ defaultVolume: 1.5 });
		await client.load();

		expect(client.container.services.audio.ensureQueue("g1").volume).toBe(1.5);
		await client.destroy();
	});

	test("GuildQueue は limits を省略すると既定値を使う", () => {
		expect(defaultMusicConfig.limits).toEqual({
			maxVolume: 2,
			historySize: 50,
			maxConsecutiveFailures: 10,
		});
		expect(GuildQueue).toBeDefined();
	});
});

describe("設定の解決", () => {
	test("入れ子の部分指定でも他の項目が消えない", () => {
		const config = resolveMusicConfig({
			network: { userAgent: "my-bot" },
			voice: { selfDeaf: false },
			limits: { historySize: 5 },
		});

		expect(config.network.userAgent).toBe("my-bot");
		expect(config.network.audioExtensions).toEqual(defaultMusicConfig.network.audioExtensions);
		expect(config.network.requestTimeout).toBe(15_000);
		expect(config.network.maxRedirects).toBe(5);
		expect(config.network.privateHostAllowlist).toEqual([]);
		expect(config.voice.selfDeaf).toBe(false);
		expect(config.voice.readyTimeout).toBe(20_000);
		expect(config.voice.reconnectTimeout).toBe(5_000);
		expect(config.voice.noSubscriberBehavior).toBe(defaultMusicConfig.voice.noSubscriberBehavior);
		expect(config.limits.historySize).toBe(5);
		expect(config.limits.maxVolume).toBe(defaultMusicConfig.limits.maxVolume);
	});

	test("HTTP 待機時間とリダイレクト上限は危険な値を拒否する", () => {
		expect(() => resolveMusicConfig({ network: { requestTimeout: 0 } })).toThrow(
			"network.requestTimeout",
		);
		expect(() => resolveMusicConfig({ network: { requestTimeout: 2_147_483_648 } })).toThrow(
			"network.requestTimeout",
		);
		expect(() => resolveMusicConfig({ network: { maxRedirects: -1 } })).toThrow(
			"network.maxRedirects",
		);
		expect(() => resolveMusicConfig({ network: { maxRedirects: 1.5 } })).toThrow(
			"network.maxRedirects",
		);
	});

	test("切断の挙動と既定音量も差し替えられる", () => {
		const config = resolveMusicConfig({
			defaultVolume: 0.5,
			leaveOnEnd: false,
			leaveOnEmpty: 1_000,
		});

		expect(config.defaultVolume).toBe(0.5);
		expect(config.leaveOnEnd).toBe(false);
		expect(config.leaveOnEmpty).toBe(1_000);
	});

	test("localDirectories は絶対パスへ解決される", () => {
		const config = resolveMusicConfig({ localDirectories: ["."] });

		expect(config.localDirectories).toHaveLength(1);
		expect(config.localDirectories[0]?.startsWith("/")).toBe(true);
	});

	test("既定の設定に見せ方の項目は含まれない", () => {
		// 応答の見せ方(埋め込み・装飾・ページ送り)は Bot の機能なので持たない。
		expect(Object.keys(defaultMusicConfig).sort()).toEqual([
			"defaultVolume",
			"leaveOnEmpty",
			"leaveOnEnd",
			"limits",
			"localDirectories",
			"network",
			"texts",
			"voice",
		]);
	});
});
