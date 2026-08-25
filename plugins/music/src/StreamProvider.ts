import type { Readable } from "node:stream";
import { StreamType } from "@discordjs/voice";
import {
	Component,
	ComponentStore,
	defineOptions,
	type Awaitable,
	type ComponentOptions,
} from "@cc-discord-framework/core";
import type { Track } from "./track.js";

export interface StreamProviderOptions extends ComponentOptions {
	/** 大きいほど先に試されます。既定 0。 */
	priority?: number;
}

/** {@link StreamProvider.stream} が返す音声ストリーム。 */
export interface AudioStream {
	/** 音声データ本体。 */
	readonly stream: Readable;
	/**
	 * ストリームの形式。既定は `Arbitrary`(ffmpeg での変換が必要)。
	 *
	 * 音源が opus を含む webm / ogg を返せる場合は `WebmOpus` / `OggOpus` を
	 * 指定してください。**変換も opus エンコードも行われず、CPU がほぼ
	 * ゼロになり ffmpeg も不要になります。**
	 */
	readonly type?: StreamType;
}

/** StreamProvider が音源を開く際の呼び出しコンテキスト。 */
export interface StreamOpenContext {
	/** キュー操作などで、この読み込みが不要になったことを知らせるシグナル。 */
	readonly signal?: AbortSignal;
}

/**
 * {@link Track} を実際の音声ストリームへ変換するコンポーネント。
 * `providers/` ディレクトリに置くと自動ロードされます。
 *
 * Resolver(何を再生するか)と Provider(どこから音を取るか)を分けている
 * ため、片方が壊れてももう片方は生き残ります。例えば YouTube の抽出が
 * 壊れたときは Provider を差し替えるだけで、Spotify の解決処理はそのまま
 * 使えます。
 *
 * ```ts
 * @StreamProvider.define({ priority: 10 })
 * export class MyProvider extends StreamProvider {
 *   canStream(track: Track) { return track.source === "my-resolver"; }
 *   async stream(track: Track): Promise<AudioStream> {
 *     return { stream: await openStream(track.url), type: StreamType.WebmOpus };
 *   }
 * }
 * ```
 */
export abstract class StreamProvider extends Component {
	declare public readonly priority: number;

	public static define(options: StreamProviderOptions = {}) {
		return defineOptions<StreamProvider>(options);
	}

	/** このトラックを再生できるか。副作用のない高速な判定にしてください。 */
	public abstract canStream(track: Track): boolean;

	/** トラックの音声ストリームを開きます。 */
	public abstract stream(track: Track, context?: StreamOpenContext): Awaitable<AudioStream>;
}

/** {@link StreamProvider} のストア。`providers/` を走査します。 */
export class StreamProviderStore extends ComponentStore<StreamProvider> {
	public constructor() {
		super({ name: "providers", base: StreamProvider });
	}

	protected override applyOptions(
		provider: StreamProvider,
		options: StreamProviderOptions,
	): void {
		Object.assign(provider, { priority: options.priority ?? 0 });
	}

	/** 優先度の高い順に並べた Provider。 */
	public byPriority(): StreamProvider[] {
		return [...this.values()].sort((a, b) => b.priority - a.priority);
	}

	/**
	 * トラックを再生できる Provider を優先度順に試します。
	 * 担当できる Provider が1つも無ければ `null`。
	 *
	 * Provider が例外を投げたときは次の Provider を試しますが、**どれも
	 * 成功しなければ最初の例外を投げ直します**。握りつぶすと
	 * `texts.httpFailed` などの失敗理由が呼び出し側へ伝わらず、
	 * ユーザーにも届かなくなるためです。
	 *
	 * 「最初」なのは、優先度がいちばん高い Provider がそのトラックに
	 * いちばん詳しいからです — 例えば YouTube のトラックでは、youtube の
	 * 「yt-dlp が見つかりません」が本当の原因で、後続の汎用 http が
	 * watch ページを開いて出す「音声ファイルではありません」は雑音です。
	 * 最後の例外を投げると、この雑音が本当の原因を隠します(実例あり)。
	 *
	 * @throws 担当した Provider がすべて失敗した場合、最初の例外。
	 */
	public async open(
		track: Track,
		context: StreamOpenContext = {},
	): Promise<AudioStream | null> {
		let firstError: unknown;
		let failed = false;

		for (const provider of this.byPriority()) {
			if (!provider.canStream(track)) continue;
			try {
				return await provider.stream(track, context);
			} catch (error) {
				// キュー操作で不要になった読み込みでは、別 Provider を新しく
				// 起動せず、直ちに呼び出し元へ中断を返す。
				if (context.signal?.aborted) throw context.signal.reason ?? error;
				if (!failed) firstError = error;
				failed = true;
				provider.logger.warn(
					{ err: error, track: track.title },
					"Provider が失敗したため次を試します",
				);
			}
		}

		if (failed) throw firstError;
		return null;
	}
}

export { StreamType };
