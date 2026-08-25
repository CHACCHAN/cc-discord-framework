/**
 * YouTube の解決(URL・プレイリスト・検索)。
 *
 * メタデータは youtubei.js(InnerTube)から取ります — 検索が速く、
 * サムネイルや投稿者も揃うためです。InnerTube が壊れた場合は yt-dlp へ
 * 自動的に切り替わります(どちらも同じ {@link Track} を返します)。
 *
 * 再生 URL の取得は {@link YouTubeStreamProvider} の担当です。解決と再生を
 * 分けてあるので、片方が壊れてももう片方は生き残ります。
 */
import { createTrack, TrackResolver, type ResolveContext, type Track } from "@cc-discord-framework/music";
import { Innertube, UniversalCache } from "youtubei.js";
import type { YouTubeConfig } from "../config.js";
import { isYouTubeUrl, parseYouTubeUrl, watchUrl } from "./url.js";
import { ytdlpJson, type YtdlpInfo } from "./ytdlp.js";

const ANY_URL = /^https?:\/\//i;

@TrackResolver.define({ name: "youtube", priority: 20 })
export class YouTubeResolver extends TrackResolver {
	#innertube: Promise<Innertube> | null = null;
	/** InnerTube が壊れていると分かったら、以降は yt-dlp だけを使う。 */
	#innertubeBroken = false;

	get config(): YouTubeConfig {
		return this.container.musicSourcesConfig.youtube;
	}

	/** デコレータの値は静的なので、設定された優先度をここで反映する。 */
	override onLoad(): void {
		Object.assign(this, { priority: this.config.priority });
	}

	override canResolve(query: string): boolean {
		if (isYouTubeUrl(query)) return true;
		// 検索担当に指名されている場合だけ、URL でない入力を引き受ける。
		return this.container.musicSourcesConfig.search === "youtube" && !ANY_URL.test(query);
	}

	override async resolve(context: ResolveContext): Promise<Track[]> {
		try {
			return await this.#resolve(context);
		} catch (error) {
			// 解決できなければ次の Resolver へ譲るが、黙って落ちると
			// 「なぜか汎用 URL として扱われた」ように見えるので残しておく。
			this.logger.warn({ err: error, query: context.query }, "YouTube の解決に失敗しました");
			return [];
		}
	}

	async #resolve({ query, requestedBy }: ResolveContext): Promise<Track[]> {
		const target = parseYouTubeUrl(query);

		if (target?.playlistId && !target.videoId) {
			return this.#playlist(target.playlistId, requestedBy);
		}
		if (target?.videoId) {
			return this.#video(target.videoId, requestedBy);
		}
		if (!isYouTubeUrl(query)) {
			return this.#search(query, requestedBy);
		}
		// YouTube のドメインだが動画でもプレイリストでもない。次の Resolver へ。
		return [];
	}

	// ---- InnerTube ------------------------------------------------------

	get #useInnertube(): boolean {
		return this.config.metadata === "innertube" && !this.#innertubeBroken;
	}

	#session(): Promise<Innertube> {
		this.#innertube ??= Innertube.create({ cache: new UniversalCache(false) });
		return this.#innertube;
	}

	/**
	 * InnerTube を試し、失敗したら yt-dlp へ落とします。一度落ちたら
	 * 以降は再試行しません(毎回の待ち時間を増やさないため)。
	 */
	async #withFallback<T>(
		viaInnertube: (yt: Innertube) => Promise<T>,
		viaYtdlp: () => Promise<T>,
	): Promise<T> {
		if (this.#useInnertube) {
			try {
				return await viaInnertube(await this.#session());
			} catch (error) {
				this.#innertubeBroken = true;
				this.#innertube = null;
				this.logger.warn(
					{ err: error },
					"InnerTube からのメタデータ取得に失敗しました。以降は yt-dlp を使います",
				);
			}
		}
		return viaYtdlp();
	}

	// ---- 解決 -----------------------------------------------------------

	async #video(videoId: string, requestedBy: string | null): Promise<Track[]> {
		return this.#withFallback(
			async (yt) => {
				const info = await yt.getBasicInfo(videoId);
				const details = info.basic_info;
				return [
					createTrack({
						title: details.title ?? videoId,
						url: watchUrl(videoId),
						duration: details.duration != null ? details.duration * 1_000 : null,
						author: details.author ?? null,
						thumbnail: bestThumbnail(details.thumbnail),
						live: details.is_live === true,
						source: this.name,
						requestedBy,
						data: { videoId },
					}),
				];
			},
			async () => {
				const info = await ytdlpJson(
					[...this.#ytdlpArgs(), "-J", "--no-playlist", "--skip-download", watchUrl(videoId)],
					this.config.ytdlp,
					this.logger,
				);
				return [this.#fromYtdlp(info, requestedBy)];
			},
		);
	}

	async #playlist(playlistId: string, requestedBy: string | null): Promise<Track[]> {
		const limit = this.config.playlistLimit;

		const viaYtdlp = async (): Promise<Track[]> => {
			const info = await ytdlpJson(
				[
					...this.#ytdlpArgs(),
					"-J",
					"--flat-playlist",
					"--playlist-end",
					String(limit),
					`https://www.youtube.com/playlist?list=${playlistId}`,
				],
				this.config.ytdlp,
				this.logger,
			);
			return (info.entries ?? []).slice(0, limit).map((entry) => this.#fromYtdlp(entry, requestedBy));
		};

		return this.#withFallback(async (yt) => {
			let page = await yt.getPlaylist(playlistId);
			const tracks: Track[] = [];
			let sawItems = false;
			for (;;) {
				for (const video of page.videos) {
					sawItems = true;
					if (tracks.length >= limit) return tracks;
					const track = playlistItemToTrack(video as PlaylistItem, this.name, requestedBy);
					if (track) tracks.push(track);
				}
				if (!page.has_continuation) break;
				page = await page.getContinuation();
			}
			if (tracks.length === 0 && sawItems) {
				// ページには動画があるのに1件も解釈できない = InnerTube の
				// 応答の形がまた変わった(2026-08 に PlaylistVideo → LockupView
				// で実際に起きた)。黙って [] を返すと汎用 URL Resolver へ
				// 落ちて「プレイリストのページを音声として開こうとして失敗」
				// になるので、yt-dlp で取り直す。検索・単一動画の InnerTube は
				// 生きていることが多いため、壊れた印(#innertubeBroken)は
				// 付けない。
				this.logger.warn(
					{ playlistId },
					"InnerTube のプレイリスト応答を解釈できなかったため yt-dlp を使います",
				);
				return viaYtdlp();
			}
			return tracks;
		}, viaYtdlp);
	}

	async #search(query: string, requestedBy: string | null): Promise<Track[]> {
		return this.#withFallback(
			async (yt) => {
				// InnerTube の検索 API は件数を指定できないため、ここでは
				// searchLimit は使わない(効くのは下の yt-dlp 経路のみ)。
				const results = await yt.search(query, { type: "video" });
				const video = results.videos[0] as SearchVideo | undefined;
				if (!video?.id) return [];
				return [
					createTrack({
						title: video.title?.text ?? video.id,
						url: watchUrl(video.id),
						duration: video.duration?.seconds != null ? video.duration.seconds * 1_000 : null,
						author: video.author?.name ?? null,
						thumbnail: video.best_thumbnail?.url ?? video.thumbnails?.at(-1)?.url ?? null,
						source: this.name,
						requestedBy,
						data: { videoId: video.id },
					}),
				];
			},
			async () => {
				const info = await ytdlpJson(
					[
						...this.#ytdlpArgs(),
						"-J",
						"--flat-playlist",
						`ytsearch${this.config.searchLimit}:${query}`,
					],
					this.config.ytdlp,
					this.logger,
				);
				const first = info.entries?.[0];
				return first ? [this.#fromYtdlp(first, requestedBy)] : [];
			},
		);
	}

	// ---- yt-dlp 共通 ----------------------------------------------------

	#ytdlpArgs(): string[] {
		return this.config.cookies ? ["--cookies", this.config.cookies] : [];
	}

	#fromYtdlp(info: YtdlpInfo, requestedBy: string | null): Track {
		const videoId = info.id ?? "";
		return createTrack({
			title: info.title ?? videoId,
			url: info.webpage_url ?? watchUrl(videoId),
			duration: info.duration != null ? Math.round(info.duration * 1_000) : null,
			author: info.uploader ?? info.channel ?? null,
			thumbnail: info.thumbnail ?? null,
			live: info.is_live === true,
			source: this.name,
			requestedBy,
			data: { videoId },
		});
	}
}

/**
 * プレイリスト1件分の InnerTube ノードを {@link Track} へ変換します。
 * 解釈できないノードは `null`(呼び出し側で読み飛ばします)。
 *
 * YouTube は 2026-08 からプレイリストの動画を旧 `PlaylistVideo` ではなく
 * `LockupView` で返すようになったため、両方の形に対応しています。
 */
export function playlistItemToTrack(
	item: PlaylistItem,
	source: string,
	requestedBy: string | null,
): Track | null {
	if (typeof item.content_id === "string" && item.content_id) {
		// 新しい LockupView。動画以外(ミックスなど)は対象外。
		if (item.content_type && item.content_type !== "VIDEO") return null;
		const image = item.content_image;
		const thumbnails = image?.image ?? image?.primary_thumbnail?.image;
		const overlays = [...(image?.overlays ?? []), ...(image?.primary_thumbnail?.overlays ?? [])];
		const badges = overlays.flatMap((overlay) => overlay.badges ?? []);
		const durationText = badges.map((badge) => badge.text).find(isDurationBadge);
		return createTrack({
			title: item.metadata?.title?.text ?? item.content_id,
			url: watchUrl(item.content_id),
			duration: durationText ? badgeDurationMs(durationText) : null,
			author:
				item.metadata?.metadata?.metadata_rows?.[0]?.metadata_parts?.[0]?.text?.text ?? null,
			// LockupView のサムネイルは大きい順に並ぶので先頭を使う。
			thumbnail: thumbnails?.[0]?.url ?? null,
			source,
			requestedBy,
			data: { videoId: item.content_id },
		});
	}

	// 旧来の PlaylistVideo。
	if (!item.id) return null;
	return createTrack({
		title: item.title?.text ?? item.id,
		url: watchUrl(item.id),
		duration: item.duration?.seconds != null ? item.duration.seconds * 1_000 : null,
		author: item.author?.name ?? null,
		thumbnail: item.thumbnails?.at(-1)?.url ?? null,
		source,
		requestedBy,
		data: { videoId: item.id },
	});
}

/** サムネイルのバッジが長さ表記("2:54"・"1:02:54")か。LIVE などを除く。 */
function isDurationBadge(text: string | undefined): text is string {
	return text !== undefined && /^\d+(?::\d{2})+$/.test(text);
}

/** "2:54" / "1:02:54" をミリ秒へ変換します。 */
function badgeDurationMs(text: string): number {
	const seconds = text.split(":").reduce((total, part) => total * 60 + Number(part), 0);
	return seconds * 1_000;
}

// youtubei.js の解析結果は動的なので、使うフィールドだけを型として書く。
interface SearchVideo {
	id?: string;
	title?: { text?: string };
	duration?: { seconds?: number };
	author?: { name?: string };
	best_thumbnail?: { url?: string };
	thumbnails?: { url?: string }[];
}

/**
 * プレイリストの1件。旧 `PlaylistVideo` と新 `LockupView` の
 * 使うフィールドだけをまとめた型。
 */
export interface PlaylistItem {
	// ---- 旧 PlaylistVideo ----
	id?: string;
	title?: { text?: string };
	duration?: { seconds?: number };
	author?: { name?: string };
	thumbnails?: { url?: string }[];
	// ---- 新 LockupView ----
	content_id?: string;
	content_type?: string;
	content_image?: {
		image?: { url?: string }[];
		/** CollectionThumbnailView の場合はこちらに入る。 */
		primary_thumbnail?: {
			image?: { url?: string }[];
			overlays?: { badges?: { text?: string }[] }[];
		};
		overlays?: { badges?: { text?: string }[] }[];
	};
	metadata?: {
		title?: { text?: string };
		metadata?: {
			metadata_rows?: { metadata_parts?: { text?: { text?: string } }[] }[];
		};
	};
}

function bestThumbnail(thumbnails: { url: string }[] | undefined): string | null {
	return thumbnails?.at(-1)?.url ?? null;
}
