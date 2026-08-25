/**
 * SoundCloud の解決(URL・プレイリスト・検索)。
 */
import { createTrack, TrackResolver, type ResolveContext, type Track } from "@cc-discord-framework/music";
import Soundcloud from "soundcloud.ts";
import type { SoundcloudPlaylist, SoundcloudTrack } from "soundcloud.ts";
import { DEFAULT_ARTWORK_SIZE, type SoundCloudConfig } from "../config.js";

const SOUNDCLOUD_URL = /^https?:\/\/(?:(?:www|m)\.)?soundcloud\.com\/[^\s]+$/i;
const ANY_URL = /^https?:\/\//i;

/** SoundCloud のクライアントを1つ作ります(client_id 未指定なら自動抽出)。 */
export function createSoundcloud(config: SoundCloudConfig): Soundcloud {
	return new Soundcloud(config.clientId ?? undefined, config.oauthToken ?? undefined);
}

/** SoundCloud のトラックを {@link Track} へ変換します。 */
export function toTrack(
	track: SoundcloudTrack,
	source: string,
	requestedBy: string | null,
	artworkSize: string | null = DEFAULT_ARTWORK_SIZE,
): Track {
	return createTrack({
		title: track.title,
		url: track.permalink_url,
		duration: track.duration ?? null,
		author: track.user?.username ?? null,
		// 既定のサムネイルは小さいので、指定サイズがあれば差し替える。
		thumbnail:
			(artworkSize === null
				? track.artwork_url
				: track.artwork_url?.replace("-large", `-${artworkSize}`)) ?? null,
		source,
		requestedBy,
		data: { id: track.id },
	});
}

@TrackResolver.define({ name: "soundcloud", priority: 20 })
export class SoundCloudResolver extends TrackResolver {
	#soundcloud: Soundcloud | null = null;

	get config(): SoundCloudConfig {
		return this.container.musicSourcesConfig.soundcloud;
	}

	/** デコレータの値は静的なので、設定された優先度をここで反映する。 */
	override onLoad(): void {
		Object.assign(this, { priority: this.config.priority });
	}

	/** SoundCloud のクライアント(`client` は Component が持つ Discord のもの)。 */
	get soundcloud(): Soundcloud {
		this.#soundcloud ??= createSoundcloud(this.config);
		return this.#soundcloud;
	}

	override canResolve(query: string): boolean {
		if (SOUNDCLOUD_URL.test(query)) return true;
		// 検索担当に指名されている場合だけ、URL でない入力を引き受ける。
		return this.container.musicSourcesConfig.search === "soundcloud" && !ANY_URL.test(query);
	}

	override async resolve(context: ResolveContext): Promise<Track[]> {
		try {
			return await this.#resolve(context);
		} catch (error) {
			// 解決できなければ次の Resolver へ譲るが、黙って落ちると
			// 「なぜか汎用 URL として扱われた」ように見えるので残しておく。
			this.logger.warn({ err: error, query: context.query }, "SoundCloud の解決に失敗しました");
			return [];
		}
	}

	async #resolve({ query, requestedBy }: ResolveContext): Promise<Track[]> {
		if (!SOUNDCLOUD_URL.test(query)) return this.#search(query, requestedBy);

		const resolved = (await this.soundcloud.resolve.get(query, true)) as unknown as
			| (SoundcloudTrack & { kind: "track" })
			| (SoundcloudPlaylist & { kind: "playlist" })
			| { kind: string };

		if (resolved.kind === "track") {
			return [toTrack(resolved as SoundcloudTrack, this.name, requestedBy, this.config.artworkSize)];
		}
		if (resolved.kind === "playlist") {
			const playlist = resolved as SoundcloudPlaylist;
			return (playlist.tracks ?? [])
				.filter((track) => typeof track.permalink_url === "string")
				.slice(0, this.config.playlistLimit)
				.map((track) => toTrack(track, this.name, requestedBy, this.config.artworkSize));
		}

		// ユーザーページなどは扱わない。次の Resolver に譲る。
		return [];
	}

	async #search(query: string, requestedBy: string | null): Promise<Track[]> {
		const result = await this.soundcloud.tracks.search({ q: query, limit: this.config.searchLimit });
		const first = result.collection?.[0];
		return first ? [toTrack(first, this.name, requestedBy, this.config.artworkSize)] : [];
	}
}
