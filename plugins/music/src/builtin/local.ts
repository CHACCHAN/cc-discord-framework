import { constants } from "node:fs";
import { open, realpath, stat, type FileHandle } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { MusicError } from "../errors.js";
import { guessStreamType, looksLikeAudio, titleFrom } from "../format.js";
import { StreamProvider, type AudioStream } from "../StreamProvider.js";
import { TrackResolver, type ResolveContext } from "../TrackResolver.js";
import { createTrack, type Track } from "../track.js";

/**
 * パスが許可ディレクトリの **内側** に収まるかを判定します。
 * ディレクトリ自身や外側のパスは拒否します。
 */
export function isWithinAllowed(candidate: string, allowed: readonly string[]): boolean {
	return allowed.some((base) => {
		const rel = relative(base, candidate);
		return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
	});
}

/**
 * 入力を許可ディレクトリ内の実パスへ解決します。
 * シンボリックリンクを辿った先が外部の場合も拒否します。
 */
export async function resolveWithin(
	input: string,
	allowed: readonly string[],
): Promise<string | null> {
	const candidates = isAbsolute(input)
		? [resolve(input)]
		: allowed.map((base) => resolve(base, input));

	for (const candidate of candidates) {
		if (!isWithinAllowed(candidate, allowed)) continue;
		try {
			// シンボリックリンクで許可範囲外へ抜けられないよう実パスで再検証する。
			const real = await realpath(candidate);
			if (isWithinAllowed(real, allowed)) return real;
		} catch {
			// 存在しないパスは次の候補へ。
		}
	}
	return null;
}

/**
 * 許可ディレクトリ配下のローカル音声ファイルを解決します。
 * `music({ localDirectories: [...] })` を設定した場合のみ登録されます。
 */
@TrackResolver.define({ name: "local", priority: 20 })
export class LocalFileResolver extends TrackResolver {
	override canResolve(query: string): boolean {
		const { audioExtensions } = this.container.musicConfig.network;
		return !/^[a-z]+:\/\//i.test(query) && looksLikeAudio(query, audioExtensions);
	}

	override async resolve({ query, requestedBy }: ResolveContext): Promise<Track[]> {
		const allowed = this.container.musicConfig.localDirectories;
		const path = await resolveWithin(query, allowed);
		if (!path) return [];

		try {
			if (!(await stat(path)).isFile()) return [];
		} catch {
			return [];
		}

		return [
			// 解決済みの実パスを保持する(再生直前に再検証できる)。
			createTrack({ title: titleFrom(path), url: path, source: this.name, requestedBy }),
		];
	}
}

/** ローカルファイルを読み出すプロバイダー。 */
@StreamProvider.define({ name: "local", priority: 20 })
export class LocalFileStreamProvider extends StreamProvider {
	override canStream(track: Track): boolean {
		return track.source === "local" && isAbsolute(track.url);
	}

	override async stream(track: Track): Promise<AudioStream> {
		const config = this.container.musicConfig;
		// キューへ入った後に設定が変わる可能性があるため、再生直前にも検証する。
		if (!isWithinAllowed(track.url, config.localDirectories)) {
			throw new MusicError(config.texts.accessDenied, { identifier: "PathNotAllowed" });
		}

		let handle: FileHandle | null = null;
		let handedOff = false;
		try {
			// 最後のパス要素が解決後に symlink へ置換されても辿らない。
			handle = await open(track.url, constants.O_RDONLY | constants.O_NOFOLLOW);
			const openedStat = await handle.stat();
			if (!openedStat.isFile()) {
				throw new MusicError(config.texts.accessDenied, { identifier: "PathNotAllowed" });
			}

			// 親ディレクトリ側の symlink 差し替えにも備え、開いた fd が実際に
			// 指しているパスを検証する。/proc が無い環境では実パスと
			// device/inode の一致を確認し、検証後は同じ fd をストリームへ渡す。
			let openedPath: string;
			try {
				openedPath = await realpath(`/proc/self/fd/${handle.fd}`);
			} catch {
				openedPath = await realpath(track.url);
			}
			if (!isWithinAllowed(openedPath, config.localDirectories)) {
				throw new MusicError(config.texts.accessDenied, { identifier: "PathNotAllowed" });
			}
			const pathStat = await stat(openedPath);
			if (openedStat.dev !== pathStat.dev || openedStat.ino !== pathStat.ino) {
				throw new MusicError(config.texts.accessDenied, { identifier: "PathChanged" });
			}

			const stream = handle.createReadStream({ autoClose: true });
			handedOff = true;
			return { stream, type: guessStreamType(track.url) };
		} catch (error) {
			if (error instanceof MusicError) throw error;
			throw new MusicError(config.texts.accessDenied, {
				cause: error,
				identifier: "PathNotAllowed",
			});
		} finally {
			if (!handedOff) await handle?.close().catch(() => {});
		}
	}
}
