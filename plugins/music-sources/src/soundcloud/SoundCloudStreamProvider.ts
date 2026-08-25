/**
 * SoundCloud の再生。
 *
 * SoundCloud は現在ほぼ HLS(AAC)でしか配信していないため、ffmpeg を
 * 通して PCM にしてから Discord へ渡します。プログレッシブ MP3 が使える
 * トラック(アップロード者がダウンロードを許可している場合)はそちらを
 * 優先します — どちらにせよ変換は必要です。
 */
import { MusicError, StreamProvider, StreamType, type AudioStream, type Track } from "@cc-discord-framework/music";
import type Soundcloud from "soundcloud.ts";
import { ffmpegPcm } from "../ffmpeg.js";
import { createSoundcloud } from "./SoundCloudResolver.js";

@StreamProvider.define({ name: "soundcloud", priority: 20 })
export class SoundCloudStreamProvider extends StreamProvider {
	#soundcloud: Soundcloud | null = null;

	/** デコレータの値は静的なので、設定された優先度をここで反映する。 */
	override onLoad(): void {
		Object.assign(this, { priority: this.container.musicSourcesConfig.soundcloud.priority });
	}

	/** SoundCloud のクライアント(`client` は Component が持つ Discord のもの)。 */
	get soundcloud(): Soundcloud {
		this.#soundcloud ??= createSoundcloud(this.container.musicSourcesConfig.soundcloud);
		return this.#soundcloud;
	}

	override canStream(track: Track): boolean {
		return track.source === "soundcloud";
	}

	override async stream(track: Track): Promise<AudioStream> {
		const source = await this.soundcloud.tracks.get(track.url);
		const url =
			(await this.soundcloud.util.streamLink(source, "progressive")) ??
			(await this.soundcloud.util.streamLink(source, "hls"));

		if (!url) {
			// 文言は music({ texts }) で差し替えられるカタログから取る
			// (music 同梱の HttpStreamProvider と同じ報告のしかた)。
			throw new MusicError(this.container.musicConfig.texts.streamFailed(track.title), {
				identifier: "NoStreamUrl",
				context: { title: track.title },
			});
		}

		return {
			stream: ffmpegPcm(url, this.container.musicSourcesConfig.ffmpeg, this.logger),
			type: StreamType.Raw,
		};
	}
}
