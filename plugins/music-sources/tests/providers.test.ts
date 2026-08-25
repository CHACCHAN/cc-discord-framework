import { describe, expect, test } from "bun:test";
import { Client } from "@cc-discord-framework/core";
import { createTrack, music, type MusicTextsOptions } from "@cc-discord-framework/music";
import { musicSources } from "../src/index.js";
import type { SoundCloudStreamProvider } from "../src/soundcloud/SoundCloudStreamProvider.js";

/** 偽の yt-dlp(渡された引数を無視して opus/webm の情報を返す)。 */
const FAKE_YTDLP = `${import.meta.dir}/fixtures/fake-ytdlp.ts`;

/** texts を上書きしたクライアント。文言がカタログから来ることを検証する。 */
function createClient(texts: MusicTextsOptions) {
	return new Client({
		intents: [],
		baseDirectory: null,
		logger: { level: "silent" },
		plugins: [
			music({ texts }),
			musicSources({
				youtube: { ytdlp: { path: "bun", commonArgs: [FAKE_YTDLP] } },
			}),
		],
	});
}

describe("プロバイダーの失敗文言は texts から取られる", () => {
	test("YouTube: HTTP エラーは texts.httpFailed の上書きが効く", async () => {
		const client = createClient({
			httpFailed: (status, title) => `カスタム失敗 ${status} ${title}`,
		});
		await client.load();
		const provider = client.stores.get("providers").get("youtube")!;
		const track = createTrack({ title: "曲A", url: "https://youtu.be/x", source: "youtube" });

		// 音源の取得だけを 403 で失敗させる(yt-dlp は偽物が成功させる)。
		const originalFetch = globalThis.fetch;
		globalThis.fetch = (async () =>
			new Response("forbidden", { status: 403 })) as unknown as typeof fetch;
		try {
			let message: string | null = null;
			try {
				await provider.stream(track);
			} catch (error) {
				message = (error as Error).message;
			}
			expect(message).toBe("カスタム失敗 403 曲A");
		} finally {
			globalThis.fetch = originalFetch;
			await client.destroy();
		}
	});

	test("SoundCloud: ストリーム URL が無いときは texts.streamFailed の上書きが効く", async () => {
		const client = createClient({ streamFailed: (title) => `SC失敗 ${title}` });
		await client.load();
		const provider = client.stores
			.get("providers")
			.get("soundcloud") as SoundCloudStreamProvider;

		// soundcloud.ts へは出ずに「ストリーム URL が取れなかった」状況を再現する。
		Object.defineProperty(provider, "soundcloud", {
			value: {
				tracks: { get: async () => ({}) },
				util: { streamLink: async () => null },
			},
		});
		const track = createTrack({
			title: "曲B",
			url: "https://soundcloud.com/a/b",
			source: "soundcloud",
		});

		await expect(Promise.resolve(provider.stream(track))).rejects.toThrow("SC失敗 曲B");
		await client.destroy();
	});
});
