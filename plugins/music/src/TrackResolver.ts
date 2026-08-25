import {
	Component,
	ComponentStore,
	defineOptions,
	type Awaitable,
	type ComponentOptions,
} from "@cc-discord-framework/core";
import type { Track } from "./track.js";

export interface TrackResolverOptions extends ComponentOptions {
	/** 大きいほど先に試されます。既定 0。 */
	priority?: number;
}

/** {@link TrackResolver.resolve} に渡される解決コンテキスト。 */
export interface ResolveContext {
	/** ユーザーが入力した文字列(URL または検索クエリ)。 */
	readonly query: string;
	/** リクエストしたユーザーの ID。 */
	readonly requestedBy: string | null;
}

/**
 * 入力(URL・検索クエリ)を {@link Track} へ解決するコンポーネント。
 * `resolvers/` ディレクトリに置くと自動ロードされます。
 *
 * **メタデータ専用ソースも Resolver として表現できます。** 例えば Spotify は
 * DRM により直接再生できませんが、Resolver として曲情報(ISRC 付き)を返せば、
 * 実際の音声は別の {@link StreamProvider} が担当できます。
 *
 * ```ts
 * @TrackResolver.define({ priority: 10 })
 * export class MyResolver extends TrackResolver {
 *   canResolve(query: string) { return query.startsWith("https://example.com/"); }
 *   async resolve({ query, requestedBy }: ResolveContext) {
 *     return [createTrack({ title: "...", url: query, source: this.name, requestedBy })];
 *   }
 * }
 * ```
 */
export abstract class TrackResolver extends Component {
	declare public readonly priority: number;

	public static define(options: TrackResolverOptions = {}) {
		return defineOptions<TrackResolver>(options);
	}

	/** この Resolver がクエリを扱えるか。副作用のない高速な判定にしてください。 */
	public abstract canResolve(query: string): boolean;

	/**
	 * クエリをトラックへ解決します。プレイリストなら複数返します。
	 * 空配列を返すと、次に優先度の高い Resolver が試されます。
	 */
	public abstract resolve(context: ResolveContext): Awaitable<Track[]>;
}

/** {@link TrackResolver} のストア。`resolvers/` を走査します。 */
export class TrackResolverStore extends ComponentStore<TrackResolver> {
	public constructor() {
		super({ name: "resolvers", base: TrackResolver });
	}

	protected override applyOptions(
		resolver: TrackResolver,
		options: TrackResolverOptions,
	): void {
		Object.assign(resolver, { priority: options.priority ?? 0 });
	}

	/** 優先度の高い順に並べた Resolver。 */
	public byPriority(): TrackResolver[] {
		return [...this.values()].sort((a, b) => b.priority - a.priority);
	}

	/**
	 * クエリを扱える Resolver を優先度順に試し、最初に結果を返したものを
	 * 採用します。どれも解決できなければ空配列。
	 */
	public async resolve(context: ResolveContext): Promise<Track[]> {
		for (const resolver of this.byPriority()) {
			if (!resolver.canResolve(context.query)) continue;
			try {
				const tracks = await resolver.resolve(context);
				if (tracks.length > 0) return tracks;
			} catch (error) {
				resolver.logger.warn(
					{ err: error, query: context.query },
					"Resolver が失敗したため次を試します",
				);
			}
		}
		return [];
	}
}
