import { describe, expect, test } from "bun:test";
import { Client } from "@cc-discord-framework/core";
import { music } from "@cc-discord-framework/music";
import { defaultFfmpegArgs, musicSources, type MusicSourcesOptions } from "../src/index.js";
import { toTrack } from "../src/soundcloud/SoundCloudResolver.js";
import type { SoundcloudTrack } from "soundcloud.ts";

function createClient(options: MusicSourcesOptions = {}) {
	return new Client({
		intents: [],
		baseDirectory: null,
		logger: { level: "silent" },
		plugins: [music(), musicSources(options)],
	});
}

describe("musicSources() の設定", () => {
	test("既定では両方の音源が登録される", async () => {
		const client = createClient();
		await client.load();

		expect(client.stores.get("resolvers").get("youtube")).toBeDefined();
		expect(client.stores.get("resolvers").get("soundcloud")).toBeDefined();
		expect(client.stores.get("providers").get("youtube")).toBeDefined();
		expect(client.stores.get("providers").get("soundcloud")).toBeDefined();

		await client.destroy();
	});

	test("false で片方だけにできる", async () => {
		const client = createClient({ soundcloud: false });
		await client.load();

		expect(client.stores.get("resolvers").get("youtube")).toBeDefined();
		expect(client.stores.get("resolvers").get("soundcloud")).toBeUndefined();
		expect(client.container.musicSourcesConfig.soundcloud.enabled).toBe(false);

		await client.destroy();
	});

	test("既定値", async () => {
		const client = createClient();
		await client.load();

		const config = client.container.musicSourcesConfig;
		expect(config.search).toBe("youtube");
		expect(config.youtube.metadata).toBe("innertube");
		expect(config.youtube.priority).toBe(20);
		expect(config.youtube.ytdlp.path).toBe("yt-dlp");
		expect(config.youtube.ytdlp.format).toBe("bestaudio[acodec=opus]/bestaudio");
		expect(config.soundcloud.clientId).toBeNull();
		expect(config.soundcloud.artworkSize).toBe("t500x500");
		expect(config.youtube.userAgent).toBe("cc-discord-framework-music-sources");
		expect(config.ffmpeg.path).toBe("ffmpeg");
		expect(config.ffmpeg.args).toBe(defaultFfmpegArgs);

		await client.destroy();
	});

	test("部分指定は既定を壊さない", async () => {
		const client = createClient({
			youtube: { searchLimit: 1, ytdlp: { path: "/opt/yt-dlp" } },
		});
		await client.load();

		const youtube = client.container.musicSourcesConfig.youtube;
		expect(youtube.searchLimit).toBe(1);
		expect(youtube.ytdlp.path).toBe("/opt/yt-dlp");
		expect(youtube.playlistLimit).toBe(100);
		expect(youtube.ytdlp.format).toBe("bestaudio[acodec=opus]/bestaudio");

		await client.destroy();
	});

	test("ffmpeg の引数を丸ごと差し替えられる", async () => {
		const args = (input: string) => ["-i", input, "-f", "wav", "pipe:1"];
		const client = createClient({ ffmpeg: { args } });
		await client.load();

		expect(client.container.musicSourcesConfig.ffmpeg.args("x")).toEqual([
			"-i",
			"x",
			"-f",
			"wav",
			"pipe:1",
		]);

		await client.destroy();
	});

	test("クライアント毎に設定が独立している", async () => {
		const a = createClient({ search: "youtube", youtube: { searchLimit: 1 } });
		const b = createClient({ search: "soundcloud", youtube: { searchLimit: 9 } });
		await a.load();
		await b.load();

		expect(a.container.musicSourcesConfig.search).toBe("youtube");
		expect(b.container.musicSourcesConfig.search).toBe("soundcloud");
		expect(a.container.musicSourcesConfig.youtube.searchLimit).toBe(1);
		expect(b.container.musicSourcesConfig.youtube.searchLimit).toBe(9);

		await a.destroy();
		await b.destroy();
	});
});

describe("SoundCloud のサムネイル", () => {
	const source = {
		title: "曲",
		permalink_url: "https://soundcloud.com/a/b",
		duration: 1_000,
		artwork_url: "https://i1.sndcdn.com/artworks-abc-large.jpg",
		user: { username: "誰か" },
		id: 1,
	} as unknown as SoundcloudTrack;

	test("既定では大きいサイズへ差し替える", () => {
		expect(toTrack(source, "soundcloud", null).thumbnail).toBe(
			"https://i1.sndcdn.com/artworks-abc-t500x500.jpg",
		);
	});

	test("サイズを指定できる", () => {
		expect(toTrack(source, "soundcloud", null, "t200x200").thumbnail).toBe(
			"https://i1.sndcdn.com/artworks-abc-t200x200.jpg",
		);
	});

	test("null なら差し替えない", () => {
		expect(toTrack(source, "soundcloud", null, null).thumbnail).toBe(
			"https://i1.sndcdn.com/artworks-abc-large.jpg",
		);
	});
});

describe("canResolve の振り分け", () => {
	test("URL は各サービスの Resolver が拾う", async () => {
		const client = createClient();
		await client.load();

		const youtube = client.stores.get("resolvers").get("youtube")!;
		const soundcloud = client.stores.get("resolvers").get("soundcloud")!;

		expect(youtube.canResolve("https://youtu.be/abc")).toBe(true);
		expect(youtube.canResolve("https://soundcloud.com/a/b")).toBe(false);
		expect(soundcloud.canResolve("https://soundcloud.com/a/b")).toBe(true);
		expect(soundcloud.canResolve("https://youtu.be/abc")).toBe(false);

		// 直リンクはどちらも拾わない(music 同梱の url リゾルバに任せる)
		expect(youtube.canResolve("https://example.com/song.opus")).toBe(false);
		expect(soundcloud.canResolve("https://example.com/song.opus")).toBe(false);

		await client.destroy();
	});

	test("素の検索語は search に指名された側だけが拾う", async () => {
		const client = createClient({ search: "soundcloud" });
		await client.load();

		expect(client.stores.get("resolvers").get("youtube")!.canResolve("lofi")).toBe(false);
		expect(client.stores.get("resolvers").get("soundcloud")!.canResolve("lofi")).toBe(true);

		await client.destroy();
	});

	test('search: "none" なら誰も検索語を拾わない', async () => {
		const client = createClient({ search: "none" });
		await client.load();

		expect(client.stores.get("resolvers").get("youtube")!.canResolve("lofi")).toBe(false);
		expect(client.stores.get("resolvers").get("soundcloud")!.canResolve("lofi")).toBe(false);

		await client.destroy();
	});

	test("設定した優先度がコンポーネントへ反映される", async () => {
		const client = createClient({ youtube: { priority: 5 }, soundcloud: { priority: 7 } });
		await client.load();

		expect(client.stores.get("resolvers").get("youtube")?.priority).toBe(5);
		expect(client.stores.get("resolvers").get("soundcloud")?.priority).toBe(7);
		expect(client.stores.get("providers").get("youtube")?.priority).toBe(5);
		expect(client.stores.get("providers").get("soundcloud")?.priority).toBe(7);

		await client.destroy();
	});

	test("既定では同梱の url リゾルバより先に試される", async () => {
		const client = createClient();
		await client.load();

		const order = client.stores
			.get("resolvers")
			.byPriority()
			.map((resolver) => resolver.name);
		expect(order.indexOf("youtube")).toBeLessThan(order.indexOf("url"));
		expect(order.indexOf("soundcloud")).toBeLessThan(order.indexOf("url"));
		expect(order.indexOf("youtube")).toBeLessThan(order.indexOf("archive"));

		await client.destroy();
	});
});
