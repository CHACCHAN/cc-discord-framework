/**
 * ffmpeg を通して PCM を得る共通経路。
 *
 * SoundCloud は HLS(AAC)しか配信していないため、Discord が要求する
 * 48kHz ステレオへ変換するには ffmpeg が要ります。ここを通ったストリームは
 * `StreamType.Raw` として渡せるので、@discordjs/voice 側では opus への
 * エンコード1回だけで済みます。
 */
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import type { Logger } from "@cc-discord-framework/core";
import type { FfmpegConfig } from "./config.js";

/** ffmpeg が見つからないときに投げます。 */
export class FfmpegMissingError extends Error {
	public constructor(path: string) {
		super(
			`ffmpeg("${path}")が見つかりません。SoundCloud など変換が必要な音源の再生には ffmpeg が必要です。`,
		);
		this.name = "FfmpegMissingError";
	}
}

/**
 * 入力 URL を ffmpeg に食わせ、標準出力の PCM を Node のストリームとして
 * 返します。ストリームが閉じられたらプロセスも確実に終了させます。
 */
export function ffmpegPcm(input: string, config: FfmpegConfig, logger: Logger): Readable {
	if (!Bun.which(config.path)) throw new FfmpegMissingError(config.path);

	const proc = Bun.spawn([config.path, ...config.args(input)], {
		stdin: "ignore",
		stdout: "pipe",
		stderr: "pipe",
	});

	const stream = Readable.fromWeb(proc.stdout as unknown as WebReadableStream<Uint8Array>);

	// 曲送りなどでストリームが捨てられたら、ffmpeg も落とす。
	const kill = () => {
		if (proc.killed) return;
		proc.kill();
	};
	stream.once("close", kill);
	stream.once("error", kill);

	// stderr は読み続けないとパイプが詰まってプロセスが止まる。
	// 診断用に先頭だけ残し、あとは捨てる。
	let diagnostics = "";
	void (async () => {
		const decoder = new TextDecoder();
		for await (const chunk of proc.stderr as ReadableStream<Uint8Array>) {
			if (diagnostics.length < STDERR_KEEP) {
				diagnostics += decoder.decode(chunk, { stream: true });
			}
		}
	})().catch(() => undefined);

	void (async () => {
		const code = await proc.exited;
		if (code === 0 || proc.killed) return;
		logger.warn(
			{ code, input, detail: diagnostics.slice(0, STDERR_KEEP).trim() },
			"ffmpeg が異常終了しました",
		);
	})();

	return stream;
}

/** 診断用に保持する stderr の最大バイト数。 */
const STDERR_KEEP = 2_000;
