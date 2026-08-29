/**
 * YouTube の再生。
 *
 * yt-dlp から opus(webm)の直リンクを取り、そのまま Discord へ渡します。
 * 変換が発生しないため **ffmpeg は不要** で、CPU もほとんど使いません。
 * opus が取れなかった場合(古い動画など)だけ ffmpeg を経由します。
 */
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { MusicError, StreamProvider, StreamType, type AudioStream, type Track } from "@cc-discord-framework/music";
import { ffmpegPcm } from "../ffmpeg.js";
import { ytdlpAudioUrl } from "./ytdlp.js";

@StreamProvider.define({ name: "youtube", priority: 20 })
export class YouTubeStreamProvider extends StreamProvider {
	/** デコレータの値は静的なので、設定された優先度をここで反映する。 */
	override onLoad(): void {
		Object.assign(this, { priority: this.container.musicSourcesConfig.youtube.priority });
	}

	override canStream(track: Track): boolean {
		return track.source === "youtube";
	}

	override async stream(track: Track): Promise<AudioStream> {
		const config = this.container.musicSourcesConfig;
		const ytdlp = { ...config.youtube.ytdlp };
		if (config.youtube.cookies) {
			ytdlp.commonArgs = [...ytdlp.commonArgs, "--cookies", config.youtube.cookies];
		}

		const { url, webm } = await ytdlpAudioUrl(track.url, ytdlp, this.logger);

		if (!webm) {
			this.logger.debug({ track: track.title }, "opus が取得できないため ffmpeg を経由します");
			return {
				stream: ffmpegPcm(url, config.ffmpeg, this.logger),
				type: StreamType.Raw,
			};
		}

		const response = await fetch(url, {
			headers: { "user-agent": config.youtube.userAgent },
		});
		// 文言は music({ texts }) で差し替えられるカタログから取る
		// (music 同梱の HttpStreamProvider と同じ報告のしかた)。
		const { texts } = this.container.musicConfig;
		if (!response.ok) {
			throw new MusicError(texts.httpFailed(response.status, track.title), {
				identifier: "HttpError",
				context: { status: response.status },
			});
		}
		if (!response.body) {
			throw new MusicError(texts.streamFailed(track.title), { identifier: "EmptyBody" });
		}

		return {
			stream: Readable.fromWeb(response.body as unknown as WebReadableStream<Uint8Array>),
			type: StreamType.WebmOpus,
		};
	}
}
