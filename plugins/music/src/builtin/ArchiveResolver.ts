import { createTrack, type Track } from "../track.js";
import { looksLikeAudio } from "../format.js";
import { TrackResolver, type ResolveContext } from "../TrackResolver.js";

/** archive.org のメタデータ API が返すファイル情報(必要な部分のみ)。 */
interface ArchiveFile {
	name?: string;
	title?: string;
	format?: string;
	length?: string;
	artist?: string;
	creator?: string;
}

interface ArchiveMetadata {
	metadata?: { title?: string; creator?: string | string[] };
	files?: ArchiveFile[];
	server?: string;
	dir?: string;
}

const DETAILS = /^https?:\/\/(?:www\.)?archive\.org\/(?:details|download)\/([^/?#]+)/i;

/**
 * Internet Archive(archive.org)のアイテムを解決します。
 *
 * パブリックドメイン・Creative Commons・公認ライブ音源(Live Music Archive)
 * などを、スクレイピングなしの公式 API 経由で扱えます。
 */
@TrackResolver.define({ name: "archive", priority: 10 })
export class ArchiveResolver extends TrackResolver {
	override canResolve(query: string): boolean {
		return DETAILS.test(query);
	}

	override async resolve({ query, requestedBy }: ResolveContext): Promise<Track[]> {
		const identifier = DETAILS.exec(query)?.[1];
		if (!identifier) return [];

		const { audioExtensions, userAgent } = this.container.musicConfig.network;

		// 外向きのリクエストは、音源の取得と同じ user-agent で名乗る。
		const response = await fetch(`https://archive.org/metadata/${identifier}`, {
			headers: { "user-agent": userAgent },
		});
		if (!response.ok) return [];
		const data = (await response.json()) as ArchiveMetadata;
		const host = data.server ?? "archive.org";
		const dir = data.dir ?? `/${identifier}`;
		const creator = Array.isArray(data.metadata?.creator)
			? data.metadata.creator[0]
			: data.metadata?.creator;

		return (data.files ?? [])
			.filter((file) => file.name && looksLikeAudio(file.name, audioExtensions))
			.map((file) =>
				createTrack({
					title: file.title ?? file.name!,
					url: `https://${host}${dir}/${encodeURIComponent(file.name!)}`,
					source: this.name,
					author: file.artist ?? creator ?? null,
					duration: parseLength(file.length),
					requestedBy,
				}),
			);
	}
}

/** archive.org の `length`("245.5" 秒 or "4:05")をミリ秒へ変換します。 */
function parseLength(length: string | undefined): number | null {
	if (!length) return null;
	if (length.includes(":")) {
		const parts = length.split(":").map(Number);
		if (parts.some(Number.isNaN)) return null;
		const seconds = parts.reduce((total, part) => total * 60 + part, 0);
		return Math.round(seconds * 1000);
	}
	const seconds = Number(length);
	return Number.isFinite(seconds) ? Math.round(seconds * 1000) : null;
}
