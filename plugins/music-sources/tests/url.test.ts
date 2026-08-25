import { describe, expect, test } from "bun:test";
import { isYouTubeUrl, parseYouTubeUrl, watchUrl } from "../src/youtube/url.js";

describe("isYouTubeUrl", () => {
	test("YouTube のホストを見分ける", () => {
		expect(isYouTubeUrl("https://www.youtube.com/watch?v=abc")).toBe(true);
		expect(isYouTubeUrl("https://youtu.be/abc")).toBe(true);
		expect(isYouTubeUrl("https://music.youtube.com/watch?v=abc")).toBe(true);
		expect(isYouTubeUrl("https://m.youtube.com/watch?v=abc")).toBe(true);
	});

	test("他は拾わない", () => {
		expect(isYouTubeUrl("https://soundcloud.com/foo/bar")).toBe(false);
		expect(isYouTubeUrl("https://example.com/song.opus")).toBe(false);
		expect(isYouTubeUrl("lofi hip hop")).toBe(false);
		expect(isYouTubeUrl("")).toBe(false);
		// 紛らわしいホスト名を通さない
		expect(isYouTubeUrl("https://youtube.com.evil.test/watch?v=abc")).toBe(false);
		expect(isYouTubeUrl("https://notyoutube.com/watch?v=abc")).toBe(false);
	});

	test("http/https 以外は拒否する", () => {
		expect(isYouTubeUrl("ftp://youtube.com/watch?v=abc")).toBe(false);
		expect(isYouTubeUrl("javascript:alert(1)")).toBe(false);
	});
});

describe("parseYouTubeUrl", () => {
	test("watch?v= から動画 ID", () => {
		expect(parseYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
			videoId: "dQw4w9WgXcQ",
			playlistId: null,
		});
	});

	test("youtu.be の短縮 URL", () => {
		expect(parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toEqual({
			videoId: "dQw4w9WgXcQ",
			playlistId: null,
		});
		expect(parseYouTubeUrl("https://youtu.be/dQw4w9WgXcQ?t=42")).toEqual({
			videoId: "dQw4w9WgXcQ",
			playlistId: null,
		});
	});

	test("shorts / embed / live", () => {
		for (const kind of ["shorts", "embed", "live", "v"]) {
			expect(parseYouTubeUrl(`https://www.youtube.com/${kind}/dQw4w9WgXcQ`)?.videoId).toBe(
				"dQw4w9WgXcQ",
			);
		}
	});

	test("プレイリストのみ", () => {
		expect(parseYouTubeUrl("https://www.youtube.com/playlist?list=PL123")).toEqual({
			videoId: null,
			playlistId: "PL123",
		});
	});

	test("動画とプレイリストの両方", () => {
		expect(parseYouTubeUrl("https://www.youtube.com/watch?v=abc&list=PL123")).toEqual({
			videoId: "abc",
			playlistId: "PL123",
		});
	});

	test("動画でもプレイリストでもなければ null", () => {
		expect(parseYouTubeUrl("https://www.youtube.com/")).toBeNull();
		expect(parseYouTubeUrl("https://www.youtube.com/@someone")).toBeNull();
		expect(parseYouTubeUrl("https://soundcloud.com/foo")).toBeNull();
		expect(parseYouTubeUrl("ただの検索語")).toBeNull();
	});
});

describe("watchUrl", () => {
	test("正規の視聴 URL を組み立てる", () => {
		expect(watchUrl("abc")).toBe("https://www.youtube.com/watch?v=abc");
	});
});
