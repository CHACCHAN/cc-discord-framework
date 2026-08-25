/**
 * 再生失敗がイベントとして外へ出ることの検証。
 *
 * プラグインの仕事は `musicError` を発火するところまでです。
 * テキストチャンネルへ勝手に送る既定動作は持ちません(表示は Bot 側の
 * `listeners/` が決めます)。エラーの **中身** が失われないこと、
 * つまり `texts.httpFailed` などの理由がそのままイベントに乗ることを
 * ここで固定します。
 */
import { describe, expect, test } from "bun:test";
import { createServer } from "node:http";
import type { Client } from "@cc-discord-framework/core";
import {
	MusicEvents,
	StreamProvider,
	createTrack,
	type AudioStream,
	type MusicConfigOptions,
	type Track,
} from "../src/index.js";
import { createMusicClient } from "./helpers.js";

/** 送信されたら記録するテキストチャンネル(プラグインは送らないはず)。 */
function fakeChannel() {
	const sent: unknown[] = [];
	const channel = {
		isSendable: () => true,
		send: async (payload: unknown) => {
			sent.push(payload);
			return {};
		},
	};
	return { channel: channel as never, sent };
}

/** `leaveOnEnd` を切った music クライアント(失敗後に切断させないため)。 */
function client(options: MusicConfigOptions = {}) {
	const { network, ...rest } = options;
	return createMusicClient({
		leaveOnEnd: false,
		leaveOnEmpty: false,
		...rest,
		network: {
			privateHostAllowlist: ["127.0.0.1"],
			...network,
		},
	});
}

/** `musicError` を購読して、届いたエラーの文言を集めます。 */
function collectErrors(bot: Client): string[] {
	const messages: string[] = [];
	bot.on(MusicEvents.Error, ((error: unknown) => {
		messages.push(error instanceof Error ? error.message : String(error));
	}) as never);
	return messages;
}

/**
 * 404 を返す HTTP 音源を1曲だけ再生しようとします。
 * 同梱の `http` Provider をそのまま通すので、実運用と同じ経路で失敗します。
 */
async function playFailing(
	bot: Client,
	textChannel: unknown,
	url?: string,
): Promise<void> {
	const server = url
		? null
		: createServer((_request, response) => {
				response.writeHead(404);
				response.end();
			});
	if (server) {
		await new Promise<void>((resolve, reject) => {
			server.once("error", reject);
			server.listen(0, "127.0.0.1", resolve);
		});
		const address = server.address();
		if (!address || typeof address === "string") throw new Error("テストサーバーを起動できません");
		url = `http://127.0.0.1:${address.port}/404.mp3`;
	}

	await bot.load();
	const queue = bot.container.services.audio.ensureQueue("g1");
	if (textChannel) queue.textChannel = textChannel as never;

	queue.add(createTrack({ title: "404", url: url!, source: "url" }));

	try {
		await queue.start();
		// 送信が走るとしたら待たずに投げられるので、1ティック待って確かめる。
		await Bun.sleep(5);
	} finally {
		if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
	}
}

describe("再生失敗の通知", () => {
	test("失敗の理由がそのまま musicError に乗る", async () => {
		const bot = client();
		const errors = collectErrors(bot);
		await playFailing(bot, null);

		expect(errors).toEqual(["音源を取得できませんでした(HTTP 404): 404"]);
		// 実際に再生できていないことも固定する(応答だけが成功していた症状)。
		expect(bot.container.services.audio.queue("g1")?.playing).toBe(false);
		await bot.destroy();
	});

	test("プラグインはテキストチャンネルへ何も送らない", async () => {
		const bot = client();
		const { channel, sent } = fakeChannel();
		await playFailing(bot, channel);

		expect(sent).toEqual([]);
		await bot.destroy();
	});

	test("リスナーがいなくてもチャンネルへは送らない(既定動作を持たない)", async () => {
		const bot = client();
		const { channel, sent } = fakeChannel();
		await playFailing(bot, channel);

		expect(sent).toEqual([]);
		expect(bot.container.services.audio.queue("g1")?.playing).toBe(false);
		await bot.destroy();
	});

	test("texts.httpFailed を差し替えるとイベントの文言が変わる", async () => {
		const bot = client({ texts: { httpFailed: (status, title) => `${title} は ${status} でした` } });
		const errors = collectErrors(bot);
		await playFailing(bot, null);

		expect(errors).toEqual(["404 は 404 でした"]);
		await bot.destroy();
	});

	test("texts.noProvider も届く(担当できる Provider が無いとき)", async () => {
		const bot = client({ texts: { noProvider: (title) => `${title} は再生できません` } });
		const errors = collectErrors(bot);
		// http(s) でないので同梱の Provider はどれも担当しない。
		await playFailing(bot, null, "unknown://track");

		expect(errors).toEqual(["404 は再生できません"]);
		await bot.destroy();
	});

	test("texts.accessDenied も届く(ローカル再生の拒否)", async () => {
		const bot = client({
			localDirectories: [import.meta.dir],
			texts: { accessDenied: "そこは読めません" },
		});
		const errors = collectErrors(bot);
		await bot.load();

		const queue = bot.container.services.audio.ensureQueue("g1");
		// 許可ディレクトリの外なので、再生直前の検証で弾かれる。
		queue.add(createTrack({ title: "外のファイル", url: "/etc/passwd", source: "local" }));

		await queue.start();
		await Bun.sleep(5);

		expect(errors).toEqual(["そこは読めません"]);
		await bot.destroy();
	});
});

@StreamProvider.define({ name: "failing-a", priority: 20 })
class FailingProviderA extends StreamProvider {
	override canStream(track: Track): boolean {
		return track.url.startsWith("fail://");
	}
	override stream(): AudioStream {
		throw new Error("Aが失敗");
	}
}

@StreamProvider.define({ name: "failing-b", priority: 10 })
class FailingProviderB extends StreamProvider {
	override canStream(track: Track): boolean {
		return track.url.startsWith("fail://");
	}
	override stream(): AudioStream {
		throw new Error("Bが失敗");
	}
}

describe("Provider の失敗の扱い", () => {
	test("担当した Provider が全滅したら、優先度最上位の例外を投げ直す", async () => {
		const bot = client();
		bot.register(FailingProviderA, FailingProviderB);
		await bot.load();

		const track = createTrack({ title: "落ちる曲", url: "fail://x", source: "test" });
		// 握りつぶすと失敗理由がイベントに乗らなくなるため、投げ直しを固定する。
		// 優先度がいちばん高い Provider がそのトラックにいちばん詳しいので、
		// **最初の**例外が本当の原因(後続の汎用フォールバックの失敗は雑音)。
		// 実例: yt-dlp 未インストールの YtdlpMissingError が、汎用 http の
		// 「音声ファイルではありません」に隠されていた。
		expect(bot.stores.get("providers").open(track)).rejects.toThrow("Aが失敗");
		await bot.destroy();
	});

	test("担当できる Provider が1つも無ければ null(例外にはしない)", async () => {
		const bot = client();
		await bot.load();

		const track = createTrack({ title: "誰も知らない曲", url: "unknown://x", source: "test" });
		expect(await bot.stores.get("providers").open(track)).toBeNull();
		await bot.destroy();
	});
});
