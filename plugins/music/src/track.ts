/** 再生対象の1曲。Resolver が生成し、StreamProvider が音声へ変換します。 */
export interface Track {
	/** 表示名。 */
	readonly title: string;
	/** 元の URL(表示・再解決に使う)。ローカルファイルの場合はパス。 */
	readonly url: string;
	/** 長さ(ミリ秒)。ラジオなど不定の場合は `null`。 */
	readonly duration: number | null;
	/** アーティスト・投稿者。 */
	readonly author: string | null;
	/** サムネイル URL。 */
	readonly thumbnail: string | null;
	/**
	 * ISRC(国際標準レコーディングコード)。
	 * Spotify のようなメタデータ専用ソースから、実際に再生できるソースへ
	 * ブリッジする際の照合キーになります。
	 */
	readonly isrc: string | null;
	/** ライブ配信・ラジオなど終端のないストリームか。 */
	readonly live: boolean;
	/** 解決した Resolver の名前。 */
	readonly source: string;
	/** リクエストしたユーザーの ID。 */
	readonly requestedBy: string | null;
	/** Provider が再生時に使う任意のデータ。 */
	readonly data: unknown;
}

/** {@link Track} を既定値付きで生成します。 */
export function createTrack(
	input: Pick<Track, "title" | "url" | "source"> & Partial<Track>,
): Track {
	return {
		duration: null,
		author: null,
		thumbnail: null,
		isrc: null,
		live: false,
		requestedBy: null,
		data: null,
		...input,
	};
}
