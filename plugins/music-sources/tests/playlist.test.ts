import { describe, expect, test } from "bun:test";
import { playlistItemToTrack, type PlaylistItem } from "../src/youtube/YouTubeResolver.js";

/**
 * 2026-08 に YouTube がプレイリストの動画を `PlaylistVideo` から
 * `LockupView` へ切り替えたことで、プレイリストが1曲も解決できなくなる
 * 実障害があった(全100件が `item.id` 無しで読み飛ばされ、汎用 URL
 * Resolver へ落ちてプレイリストのページを音声として開こうとしていた)。
 * このフィクスチャは実際の InnerTube 応答(youtubei.js 18)からの抜粋。
 */
const lockup: PlaylistItem = {
	content_id: "ekr2nIex040",
	content_type: "VIDEO",
	content_image: {
		image: [
			{ url: "https://i.ytimg.com/vi/ekr2nIex040/hqdefault.jpg?big" },
			{ url: "https://i.ytimg.com/vi/ekr2nIex040/hqdefault.jpg?small" },
		],
		overlays: [
			{ badges: [{ text: "2:54" }] },
			{}, // ThumbnailHoverOverlayToggleActionsView(badges なし)
		],
	},
	metadata: {
		title: { text: "ROSÉ & Bruno Mars - APT. (Official Music Video)" },
		metadata: {
			metadata_rows: [
				{ metadata_parts: [{ text: { text: "ROSÉ and Bruno Mars" } }] },
				{ metadata_parts: [{ text: { text: "2.6B views" } }, { text: { text: "1 year ago" } }] },
			],
		},
	},
};

describe("playlistItemToTrack: LockupView(2026-08 以降の形)", () => {
	test("動画 ID・タイトル・長さ・投稿者・サムネイルを取り出す", () => {
		const track = playlistItemToTrack(lockup, "youtube", "user-1");
		expect(track).not.toBeNull();
		expect(track!.url).toBe("https://www.youtube.com/watch?v=ekr2nIex040");
		expect(track!.title).toBe("ROSÉ & Bruno Mars - APT. (Official Music Video)");
		expect(track!.duration).toBe(174_000);
		expect(track!.author).toBe("ROSÉ and Bruno Mars");
		expect(track!.thumbnail).toBe("https://i.ytimg.com/vi/ekr2nIex040/hqdefault.jpg?big");
		expect(track!.source).toBe("youtube");
		expect(track!.requestedBy).toBe("user-1");
		expect(track!.data).toEqual({ videoId: "ekr2nIex040" });
	});

	test("1時間超の長さ表記(H:MM:SS)も読める", () => {
		const track = playlistItemToTrack(
			{
				...lockup,
				content_image: { ...lockup.content_image, overlays: [{ badges: [{ text: "1:02:54" }] }] },
			},
			"youtube",
			null,
		);
		expect(track!.duration).toBe((1 * 3600 + 2 * 60 + 54) * 1_000);
	});

	test("LIVE バッジは長さとして解釈しない", () => {
		const track = playlistItemToTrack(
			{
				...lockup,
				content_image: { ...lockup.content_image, overlays: [{ badges: [{ text: "LIVE" }] }] },
			},
			"youtube",
			null,
		);
		expect(track).not.toBeNull();
		expect(track!.duration).toBeNull();
	});

	test("動画でない LockupView(ミックスなど)は読み飛ばす", () => {
		expect(
			playlistItemToTrack({ ...lockup, content_type: "PLAYLIST" }, "youtube", null),
		).toBeNull();
	});

	test("メタデータが欠けていても ID だけで成立する", () => {
		const track = playlistItemToTrack({ content_id: "abc123def45" }, "youtube", null);
		expect(track).not.toBeNull();
		expect(track!.title).toBe("abc123def45");
		expect(track!.duration).toBeNull();
		expect(track!.author).toBeNull();
		expect(track!.thumbnail).toBeNull();
	});
});

describe("playlistItemToTrack: 旧 PlaylistVideo", () => {
	test("従来の形も変わらず読める", () => {
		const track = playlistItemToTrack(
			{
				id: "dQw4w9WgXcQ",
				title: { text: "Never Gonna Give You Up" },
				duration: { seconds: 213 },
				author: { name: "Rick Astley" },
				thumbnails: [{ url: "small.jpg" }, { url: "large.jpg" }],
			},
			"youtube",
			"user-2",
		);
		expect(track).not.toBeNull();
		expect(track!.url).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
		expect(track!.title).toBe("Never Gonna Give You Up");
		expect(track!.duration).toBe(213_000);
		expect(track!.author).toBe("Rick Astley");
		// 旧形のサムネイルは小さい順なので末尾が最大。
		expect(track!.thumbnail).toBe("large.jpg");
		expect(track!.requestedBy).toBe("user-2");
	});

	test("ID が無ければ読み飛ばす", () => {
		expect(playlistItemToTrack({ title: { text: "壊れた項目" } }, "youtube", null)).toBeNull();
	});
});
