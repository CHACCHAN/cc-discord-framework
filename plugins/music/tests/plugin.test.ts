import { describe, expect, test } from "bun:test";
import { StreamType } from "@discordjs/voice";
import {
	ArchiveResolver,
	HttpStreamProvider,
	UrlResolver,
	createTrack,
	extensionOf,
	guessStreamType,
	looksLikeAudio,
	titleFrom,
	type MusicConfigOptions,
} from "../src/index.js";
import { createMusicClient } from "./helpers.js";

describe("プラグインの登録", () => {
	test("resolvers / providers ストアと audio サービスを追加する", async () => {
		const client = createMusicClient();
		await client.load();

		expect(client.stores.get("resolvers")).toBeDefined();
		expect(client.stores.get("providers")).toBeDefined();
		expect(client.container.services.audio).toBeDefined();
		await client.destroy();
	});

	test("既定では遵法ソースのみ同梱し、ローカル再生は無効", async () => {
		const client = createMusicClient();
		await client.load();

		const resolvers = [...client.stores.get("resolvers").keys()].sort();
		const providers = [...client.stores.get("providers").keys()].sort();
		expect(resolvers).toEqual(["archive", "url"]);
		expect(providers).toEqual(["http"]);
		await client.destroy();
	});

	test("localDirectories を指定するとローカル用コンポーネントが増える", async () => {
		const client = createMusicClient({ localDirectories: [import.meta.dir] });
		await client.load();

		expect(client.stores.get("resolvers").get("local")).toBeDefined();
		expect(client.stores.get("providers").get("local")).toBeDefined();
		await client.destroy();
	});

	test("コマンドは登録しない(Bot の機能は client 側で書く)", async () => {
		const client = createMusicClient();
		await client.load();
		expect(client.stores.get("commands").size).toBe(0);
		await client.destroy();
	});

	test("設定はコンテナ経由で配られ、クライアント間で混ざらない", async () => {
		const a = createMusicClient({ defaultVolume: 0.5 });
		const b = createMusicClient({ defaultVolume: 1.5 });
		await a.load();
		await b.load();

		expect(a.container.musicConfig.defaultVolume).toBe(0.5);
		expect(b.container.musicConfig.defaultVolume).toBe(1.5);
		await a.destroy();
		await b.destroy();
	});

	test("leaveOnEmpty: false で voiceStateUpdate リスナーを登録しない", async () => {
		const client = createMusicClient({ leaveOnEmpty: false });
		await client.load();
		expect(client.stores.get("listeners").size).toBe(0);
		await client.destroy();
	});
});

describe("フォーマット判定", () => {
	test("opus を含むコンテナは変換不要と判定する", () => {
		expect(guessStreamType("https://x/a.opus")).toBe(StreamType.OggOpus);
		expect(guessStreamType("https://x/a.webm")).toBe(StreamType.WebmOpus);
		expect(guessStreamType("https://x/a.mp3")).toBe(StreamType.Arbitrary);
		// .ogg は Vorbis の可能性があるため ffmpeg 経由にする
		expect(guessStreamType("https://x/a.ogg")).toBe(StreamType.Arbitrary);
	});

	test("Content-Type が拡張子より優先される", () => {
		expect(guessStreamType("https://x/stream", "audio/webm")).toBe(StreamType.WebmOpus);
		expect(guessStreamType("https://x/a.mp3", "audio/opus")).toBe(StreamType.OggOpus);
	});

	test("拡張子とタイトルを取り出す", () => {
		expect(extensionOf("https://x/song.flac?token=1")).toBe("flac");
		expect(extensionOf("https://x/stream")).toBeNull();
		expect(titleFrom("https://x/My%20Song.mp3")).toBe("My Song");
		expect(looksLikeAudio("https://x/a.mp3")).toBe(true);
		expect(looksLikeAudio("https://x/page.html")).toBe(false);
	});

	test("扱う拡張子は差し替えられる", () => {
		expect(looksLikeAudio("https://x/a.mp3", ["flac"])).toBe(false);
		expect(looksLikeAudio("https://x/page.html", ["html"])).toBe(true);
	});
});

describe("同梱 Resolver / Provider", () => {
	test("UrlResolver は http(s) を受け付け、拡張子なしは LIVE 扱い", async () => {
		const client = createMusicClient();
		await client.load();
		const resolvers = client.stores.get("resolvers");

		const [file] = await resolvers.resolve({
			query: "https://example.com/song.mp3",
			requestedBy: "u1",
		});
		expect(file?.title).toBe("song");
		expect(file?.live).toBe(false);
		expect(file?.requestedBy).toBe("u1");

		const [radio] = await resolvers.resolve({
			query: "https://ice.example.com/stream",
			requestedBy: null,
		});
		expect(radio?.live).toBe(true);
		await client.destroy();
	});

	test("URL でないクエリは解決されない(既定構成)", async () => {
		const client = createMusicClient();
		await client.load();
		const tracks = await client.stores
			.get("resolvers")
			.resolve({ query: "なにか検索語", requestedBy: null });
		expect(tracks).toEqual([]);
		await client.destroy();
	});

	test("ArchiveResolver は archive.org の URL だけを扱う", async () => {
		const client = createMusicClient();
		await client.load();
		const archive = client.stores.get("resolvers").get("archive") as ArchiveResolver;

		expect(archive.canResolve("https://archive.org/details/some-item")).toBe(true);
		expect(archive.canResolve("https://example.com/a.mp3")).toBe(false);
		await client.destroy();
	});

	describe("ArchiveResolver のファイル選別", () => {
		/** メタデータ API の応答(音声2種と画像1つ)。 */
		const METADATA = {
			server: "ia800.us.archive.org",
			dir: "/0/items/sample",
			metadata: { title: "サンプル", creator: "だれか" },
			files: [
				{ name: "song.mp3", length: "125" },
				{ name: "song.flac", length: "4:05" },
				{ name: "cover.jpg" },
			],
		};

		/** メタデータ API をスタブして解決を1回走らせます(通信はしません)。 */
		async function resolveArchive(options: MusicConfigOptions = {}): Promise<string[]> {
			const client = createMusicClient(options);
			await client.load();
			const archive = client.stores.get("resolvers").get("archive") as ArchiveResolver;

			const original = globalThis.fetch;
			globalThis.fetch = (async () => Response.json(METADATA)) as unknown as typeof fetch;
			try {
				const tracks = await archive.resolve({
					query: "https://archive.org/details/sample",
					requestedBy: null,
				});
				return tracks.map((track) => track.title);
			} finally {
				globalThis.fetch = original;
				await client.destroy();
			}
		}

		test("既定では音声ファイルだけを拾う", async () => {
			expect(await resolveArchive()).toEqual(["song.mp3", "song.flac"]);
		});

		test("network.audioExtensions が選別に効く", async () => {
			expect(await resolveArchive({ network: { audioExtensions: ["flac"] } })).toEqual([
				"song.flac",
			]);
		});
	});

	test("HttpStreamProvider は http(s) のトラックだけを扱う", async () => {
		const client = createMusicClient();
		await client.load();
		const http = client.stores.get("providers").get("http") as HttpStreamProvider;

		expect(http.canStream(createTrack({ title: "a", url: "https://x/a.mp3", source: "url" }))).toBe(true);
		expect(http.canStream(createTrack({ title: "a", url: "/tmp/a.mp3", source: "local" }))).toBe(false);
		await client.destroy();
	});

	test("優先度順に並ぶ(archive が url より先)", async () => {
		const client = createMusicClient();
		await client.load();
		expect(client.stores.get("resolvers").byPriority().map((r) => r.name)).toEqual([
			"archive",
			"url",
		]);
		await client.destroy();
	});

	test("UrlResolver は最後の受け皿として機能する", async () => {
		const client = createMusicClient();
		await client.load();
		const url = client.stores.get("resolvers").get("url") as UrlResolver;
		expect(url.priority).toBe(0);
		await client.destroy();
	});
});
