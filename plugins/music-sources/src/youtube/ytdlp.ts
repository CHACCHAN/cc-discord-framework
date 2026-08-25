/**
 * yt-dlp の呼び出し。
 *
 * # なぜ yt-dlp なのか
 *
 * 2026-08 時点で、YouTube は InnerTube のどのクライアント(WEB / ANDROID /
 * IOS / TV / MWEB / YTMUSIC)からのリクエストに対しても **再生 URL を
 * 返さなくなっています**(`streaming_data` のフォーマットに `url` も
 * `signature_cipher` も入らない)。実測で確認済みです。
 *
 * 一方 yt-dlp は、この手の対策への追随を専業で行っているプロジェクトです。
 * 「外的要因で壊れる層は借りる」という方針どおり、再生 URL の取得だけを
 * yt-dlp に任せています。**取得できるのは opus(webm)なので、Discord へは
 * 変換なしで渡せます**(ffmpeg 不要)。
 *
 * yt-dlp は頻繁な更新が前提のツールなので、パッケージへ同梱せず
 * システムにインストールされたものを使います。
 */
import type { Logger } from "@cc-discord-framework/core";
import type { YtdlpConfig } from "../config.js";

/** yt-dlp が見つからないときに投げます。 */
export class YtdlpMissingError extends Error {
	public constructor(path: string) {
		super(
			`yt-dlp("${path}")が見つかりません。YouTube の再生には yt-dlp が必要です。` +
				`インストール後、必要なら musicSources({ youtube: { ytdlp: { path } } }) で場所を指定してください。`,
		);
		this.name = "YtdlpMissingError";
	}
}

/** yt-dlp の実行に失敗したときに投げます。 */
export class YtdlpError extends Error {
	public constructor(message: string) {
		super(message);
		this.name = "YtdlpError";
	}
}

/** yt-dlp の `-J` が返す情報のうち、ここで使う部分。 */
export interface YtdlpInfo {
	id?: string;
	title?: string;
	url?: string;
	duration?: number | null;
	uploader?: string | null;
	channel?: string | null;
	thumbnail?: string | null;
	is_live?: boolean;
	acodec?: string;
	ext?: string;
	webpage_url?: string;
	entries?: YtdlpInfo[];
}

/** yt-dlp を実行して JSON を受け取ります。 */
export async function ytdlpJson(
	args: readonly string[],
	config: YtdlpConfig,
	logger: Logger,
): Promise<YtdlpInfo> {
	if (!Bun.which(config.path)) throw new YtdlpMissingError(config.path);

	const proc = Bun.spawn([config.path, ...config.commonArgs, ...args], {
		stdin: "ignore",
		stdout: "pipe",
		stderr: "pipe",
	});

	// ハングした yt-dlp がギルドのキューを塞ぎ続けないための保険。
	// タイマーは下の await と独立に動くので、呼び出し側がこの Promise を
	// 待つのをやめてもプロセスは必ず kill される。
	let timedOut = false;
	const timer =
		typeof config.timeout === "number"
			? setTimeout(() => {
					timedOut = true;
					proc.kill();
				}, config.timeout)
			: null;

	try {
		const [output, stderr, code] = await Promise.all([
			new Response(proc.stdout as ReadableStream<Uint8Array>).text(),
			new Response(proc.stderr as ReadableStream<Uint8Array>).text(),
			proc.exited,
		]);

		if (timedOut) {
			logger.debug({ args, timeout: config.timeout }, "yt-dlp がタイムアウトしました");
			throw new YtdlpError(
				`yt-dlp が ${config.timeout}ms 以内に完了しなかったため中断しました`,
			);
		}

		if (code !== 0) {
			logger.debug({ code, args, stderr: stderr.trim() }, "yt-dlp が異常終了しました");
			throw new YtdlpError(`yt-dlp の実行に失敗しました: ${firstLine(stderr) || `終了コード ${code}`}`);
		}

		try {
			return JSON.parse(output) as YtdlpInfo;
		} catch {
			throw new YtdlpError("yt-dlp の出力を解釈できませんでした");
		}
	} finally {
		if (timer !== null) clearTimeout(timer);
	}
}

/** 再生可能な音声 URL を取り出します。 */
export async function ytdlpAudioUrl(
	target: string,
	config: YtdlpConfig,
	logger: Logger,
): Promise<{ url: string; webm: boolean; live: boolean }> {
	const info = await ytdlpJson(["-J", "--no-playlist", "-f", config.format, target], config, logger);
	if (!info.url) throw new YtdlpError("再生できる音声フォーマットが見つかりませんでした");
	return {
		url: info.url,
		// opus in webm ならそのまま Discord へ渡せる。
		webm: info.ext === "webm" && info.acodec === "opus",
		live: info.is_live === true,
	};
}

function firstLine(text: string): string {
	return text.trim().split("\n")[0] ?? "";
}
