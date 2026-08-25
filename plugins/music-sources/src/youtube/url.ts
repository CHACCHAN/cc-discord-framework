/** YouTube の URL 判定と ID 取り出し。 */

const HOSTS = new Set([
	"youtube.com",
	"www.youtube.com",
	"m.youtube.com",
	"music.youtube.com",
	"youtu.be",
	"www.youtu.be",
]);

export interface YouTubeTarget {
	/** 動画 ID(あれば)。 */
	videoId: string | null;
	/** プレイリスト ID(あれば)。 */
	playlistId: string | null;
}

/** YouTube の URL か。 */
export function isYouTubeUrl(query: string): boolean {
	const url = parse(query);
	return url !== null && HOSTS.has(url.hostname);
}

/**
 * YouTube の URL から動画 / プレイリストの ID を取り出します。
 * `watch?v=`・`youtu.be/`・`shorts/`・`embed/`・`live/`・`list=` に対応。
 */
export function parseYouTubeUrl(query: string): YouTubeTarget | null {
	const url = parse(query);
	if (!url || !HOSTS.has(url.hostname)) return null;

	const playlistId = url.searchParams.get("list");
	const fromQuery = url.searchParams.get("v");
	if (fromQuery) return { videoId: fromQuery, playlistId };

	if (url.hostname.endsWith("youtu.be")) {
		const id = url.pathname.slice(1).split("/")[0];
		return { videoId: id || null, playlistId };
	}

	const [, kind, id] = url.pathname.split("/");
	if (id && (kind === "shorts" || kind === "embed" || kind === "live" || kind === "v")) {
		return { videoId: id, playlistId };
	}

	return playlistId ? { videoId: null, playlistId } : null;
}

/** 動画 ID から正規の視聴 URL を組み立てます。 */
export function watchUrl(videoId: string): string {
	return `https://www.youtube.com/watch?v=${videoId}`;
}

function parse(value: string): URL | null {
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:" ? url : null;
	} catch {
		return null;
	}
}
