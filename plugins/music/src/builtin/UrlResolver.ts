import { createTrack, type Track } from "../track.js";
import { looksLikeAudio, titleFrom } from "../format.js";
import { TrackResolver, type ResolveContext } from "../TrackResolver.js";

/**
 * http(s) の直リンクを解決します(S3 / R2 / 自前VPS / Icecast ラジオなど)。
 *
 * 優先度は最低(0)なので、より具体的な Resolver があればそちらが優先され、
 * これは最後の受け皿として働きます。
 */
@TrackResolver.define({ name: "url", priority: 0 })
export class UrlResolver extends TrackResolver {
	override canResolve(query: string): boolean {
		return /^https?:\/\//i.test(query);
	}

	override resolve({ query, requestedBy }: ResolveContext): Track[] {
		// 拡張子がなければラジオ等の連続ストリームとみなし、長さは不定にする。
		const live = !looksLikeAudio(query, this.container.musicConfig.network.audioExtensions);
		return [
			createTrack({
				title: titleFrom(query),
				url: query,
				source: this.name,
				live,
				requestedBy,
			}),
		];
	}
}
