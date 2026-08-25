import { lookup } from "node:dns/promises";
import { request as httpRequest, type IncomingMessage } from "node:http";
import { request as httpsRequest, type RequestOptions } from "node:https";
import { isIP } from "node:net";
import type { MusicNetworkConfig } from "../config.js";
import { MusicError } from "../errors.js";
import { guessStreamType } from "../format.js";
import {
	StreamProvider,
	type AudioStream,
	type StreamOpenContext,
} from "../StreamProvider.js";
import type { MusicTexts } from "../texts.js";
import type { Track } from "../track.js";

/** HTML を返された場合に、無音ではなく明確なエラーにするための判定。 */
const NON_AUDIO = /^(text\/html|application\/xhtml)/i;

/** HTTP のリダイレクトとして Location を追うステータス。 */
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

/** URL.hostname と設定値を同じ形式へ揃えます。 */
function normalizeHost(host: string): string {
	const lower = host.trim().toLowerCase();
	const unwrapped = lower.startsWith("[") && lower.endsWith("]") ? lower.slice(1, -1) : lower;
	return unwrapped.endsWith(".") ? unwrapped.slice(0, -1) : unwrapped;
}

/** IPv4 アドレスを4つの数値へ分解します。 */
function parseIpv4(address: string): readonly [number, number, number, number] | null {
	if (isIP(address) !== 4) return null;
	const values = address.split(".").map(Number);
	if (values.length !== 4 || values.some((value) => !Number.isInteger(value))) return null;
	return values as unknown as readonly [number, number, number, number];
}

/** IPv6 アドレスを128bit整数へ変換します。 */
function parseIpv6(address: string): bigint | null {
	let source = address.split("%", 1)[0]?.toLowerCase() ?? "";
	if (isIP(source) !== 6) return null;

	// IPv4-mapped 表記を通常の2セグメントへ変換してから展開する。
	if (source.includes(".")) {
		const lastColon = source.lastIndexOf(":");
		const ipv4 = parseIpv4(source.slice(lastColon + 1));
		if (!ipv4) return null;
		const high = ((ipv4[0] << 8) | ipv4[1]).toString(16);
		const low = ((ipv4[2] << 8) | ipv4[3]).toString(16);
		source = `${source.slice(0, lastColon)}:${high}:${low}`;
	}

	const halves = source.split("::");
	if (halves.length > 2) return null;
	const left = halves[0] ? halves[0].split(":") : [];
	const right = halves[1] ? halves[1].split(":") : [];
	const missing = 8 - left.length - right.length;
	if ((halves.length === 1 && missing !== 0) || (halves.length === 2 && missing < 1)) return null;
	const segments = [...left, ...Array.from({ length: missing }, () => "0"), ...right];
	if (segments.length !== 8) return null;

	let value = 0n;
	for (const segment of segments) {
		if (!/^[0-9a-f]{1,4}$/.test(segment)) return null;
		value = (value << 16n) | BigInt(Number.parseInt(segment, 16));
	}
	return value;
}

/** 128bit アドレスが指定した CIDR に含まれるかを判定します。 */
function inIpv6Cidr(value: bigint, base: bigint, prefix: number): boolean {
	const shift = BigInt(128 - prefix);
	return value >> shift === base >> shift;
}

/**
 * SSRF の接続先として拒否すべき、公開インターネット以外のアドレスか。
 * IANA の special-purpose ranges を保守的に扱い、必要な宛先だけ設定で
 * 明示許可する設計にしています。
 *
 * @internal
 */
export function isPrivateNetworkAddress(address: string): boolean {
	const ipv4 = parseIpv4(address);
	if (ipv4) {
		const [a, b, c] = ipv4;
		return (
			a === 0 ||
			a === 10 ||
			(a === 100 && b >= 64 && b <= 127) ||
			a === 127 ||
			(a === 169 && b === 254) ||
			(a === 172 && b >= 16 && b <= 31) ||
			(a === 192 && b === 0 && c === 0) ||
			(a === 192 && b === 0 && c === 2) ||
			(a === 192 && b === 88 && c === 99) ||
			(a === 192 && b === 168) ||
			(a === 198 && (b === 18 || b === 19)) ||
			(a === 198 && b === 51 && c === 100) ||
			(a === 203 && b === 0 && c === 113) ||
			a >= 224
		);
	}

	const ipv6 = parseIpv6(address);
	if (ipv6 === null) return true;

	// IPv4-mapped IPv6 は埋め込まれた IPv4 を同じ規則で判定する。
	if (ipv6 >> 32n === 0xffffn) {
		const tail = Number(ipv6 & 0xffff_ffffn);
		return isPrivateNetworkAddress(
			`${tail >>> 24}.${(tail >>> 16) & 0xff}.${(tail >>> 8) & 0xff}.${tail & 0xff}`,
		);
	}

	// 公開グローバルユニキャスト(2000::/3)以外は既定拒否する。これで
	// unspecified / loopback / ULA / link-local / multicast もまとめて拒否される。
	if (!inIpv6Cidr(ipv6, 0x2000n << 112n, 3)) return true;

	// 2000::/3 内にある、文書・プロトコル割当・移行技術用の特殊範囲。
	// 2001::/23 は IANA 上、より具体的な一部割当を除いて Globally
	// Reachable=false。SSRF 防御では到達可能な例外まで保守的に既定拒否し、
	// 必要なホストだけ privateHostAllowlist で明示許可してもらう。
	return (
		inIpv6Cidr(ipv6, 0x2001_0000n << 96n, 23) || // IETF protocol assignments
		inIpv6Cidr(ipv6, 0x2001_0db8n << 96n, 32) || // documentation
		inIpv6Cidr(ipv6, 0x2002n << 112n, 16) || // 6to4
		inIpv6Cidr(ipv6, 0x3fffn << 112n, 20) // documentation
	);
}

/** AbortSignal と Promise を競争させ、DNS 待機も有限にします。 */
function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
	if (signal.aborted) return Promise.reject(signal.reason);
	return new Promise<T>((resolve, reject) => {
		const onAbort = () => reject(signal.reason);
		signal.addEventListener("abort", onAbort, { once: true });
		promise.then(
			(value) => {
				signal.removeEventListener("abort", onAbort);
				resolve(value);
			},
			(error) => {
				signal.removeEventListener("abort", onAbort);
				reject(error);
			},
		);
	});
}

/** DNS を1回だけ引き、検証済みの IP として接続処理へ渡します。 */
async function resolveTarget(
	url: URL,
	network: MusicNetworkConfig,
	texts: MusicTexts,
	signal: AbortSignal,
): Promise<{ address: string; family: 4 | 6 }> {
	const host = normalizeHost(url.hostname);
	const literalFamily = isIP(host);
	const addresses = literalFamily
		? [{ address: host, family: literalFamily as 4 | 6 }]
		: await abortable(lookup(host, { all: true, order: "verbatim" }), signal);

	if (addresses.length === 0) throw new Error(`DNS からアドレスが返されませんでした: ${host}`);
	const explicitlyAllowed = network.privateHostAllowlist.some(
		(allowed) => normalizeHost(allowed) === host,
	);
	if (!explicitlyAllowed && addresses.some(({ address }) => isPrivateNetworkAddress(address))) {
		throw new MusicError(texts.privateAddressDenied(host), {
			identifier: "PrivateAddressDenied",
			context: { host, addresses: addresses.map(({ address }) => address) },
		});
	}

	// request() に検査済み IP を直接渡し、検査後の DNS rebinding を防ぐ。
	const selected = addresses[0]!;
	const family = isIP(selected.address);
	if (family !== 4 && family !== 6) {
		throw new Error(`DNS から不正なアドレスが返されました: ${selected.address}`);
	}
	return { address: selected.address, family };
}

/** 検査済み IP へ Host / SNI を保ったまま GET します。 */
function requestPinned(
	url: URL,
	target: { address: string; family: 4 | 6 },
	userAgent: string,
	signal: AbortSignal,
): Promise<IncomingMessage> {
	return new Promise((resolve, reject) => {
		const originalHost = normalizeHost(url.hostname);
		const options: RequestOptions = {
			protocol: url.protocol,
			hostname: target.address,
			family: target.family,
			port: url.port || undefined,
			path: `${url.pathname}${url.search}`,
			method: "GET",
			headers: {
				host: url.host,
				"user-agent": userAgent,
			},
			signal,
			// DNS 名の証明書検証と SNI は接続先 IP ではなく元のホストで行う。
			servername: isIP(originalHost) === 0 ? originalHost : undefined,
		};

		const request = url.protocol === "https:" ? httpsRequest : httpRequest;
		const outgoing = request(options, resolve);
		outgoing.once("error", reject);
		outgoing.end();
	});
}

/** リダイレクトごとに URL を解決・検査し直して最終応答を返します。 */
async function requestWithRedirects(
	url: URL,
	network: MusicNetworkConfig,
	texts: MusicTexts,
	track: Track,
	signal: AbortSignal,
	redirects = 0,
): Promise<IncomingMessage> {
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new MusicError(texts.streamFailed(track.title), {
			identifier: "InvalidProtocol",
			context: { protocol: url.protocol },
		});
	}

	const target = await resolveTarget(url, network, texts, signal);
	const response = await requestPinned(url, target, network.userAgent, signal);
	const status = response.statusCode ?? 0;
	const location = response.headers.location;

	if (REDIRECT_STATUSES.has(status) && location) {
		response.destroy();
		if (redirects >= network.maxRedirects) {
			throw new MusicError(texts.tooManyRedirects(track.title), {
				identifier: "TooManyRedirects",
				context: { redirects, url: url.href },
			});
		}
		return requestWithRedirects(
			new URL(location, url),
			network,
			texts,
			track,
			signal,
			redirects + 1,
		);
	}

	return response;
}

/**
 * http(s) URL から音声を取得する既定のプロバイダー。
 * 直リンク・オブジェクトストレージ・Icecast/Shoutcast ラジオに対応します。
 */
@StreamProvider.define({ name: "http", priority: 0 })
export class HttpStreamProvider extends StreamProvider {
	override canStream(track: Track): boolean {
		return /^https?:\/\//i.test(track.url);
	}

	override async stream(track: Track, context: StreamOpenContext = {}): Promise<AudioStream> {
		const { texts, network } = this.container.musicConfig;
		const timeout = new AbortController();
		const timer = setTimeout(
			() => timeout.abort(new DOMException("HTTP リクエストがタイムアウトしました", "TimeoutError")),
			network.requestTimeout,
		);
		const signal = context.signal
			? AbortSignal.any([context.signal, timeout.signal])
			: timeout.signal;

		let response: IncomingMessage;
		try {
			response = await requestWithRedirects(
				new URL(track.url),
				network,
				texts,
				track,
				signal,
			);
		} catch (error) {
			if (context.signal?.aborted) throw context.signal.reason ?? error;
			if (timeout.signal.aborted) {
				throw new MusicError(texts.httpTimedOut(track.title), {
					cause: error,
					identifier: "HttpTimeout",
					context: { timeout: network.requestTimeout },
				});
			}
			if (error instanceof MusicError) throw error;
			throw new MusicError(texts.streamFailed(track.title), {
				cause: error,
				identifier: "HttpRequestFailed",
			});
		} finally {
			clearTimeout(timer);
		}

		const status = response.statusCode ?? 0;
		if (status < 200 || status >= 300) {
			response.destroy();
			throw new MusicError(texts.httpFailed(status, track.title), {
				identifier: "HttpError",
				context: { status },
			});
		}

		const rawContentType = response.headers["content-type"];
		const contentType = Array.isArray(rawContentType) ? rawContentType[0] : rawContentType;
		if (contentType && NON_AUDIO.test(contentType)) {
			response.destroy();
			throw new MusicError(texts.notAudio(contentType), {
				identifier: "NotAudio",
				context: { contentType },
			});
		}

		return {
			stream: response,
			type: guessStreamType(track.url, contentType),
		};
	}
}
