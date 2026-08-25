import { afterEach, describe, expect, test } from "bun:test";
import {
	createServer as createHttpServer,
	type RequestListener,
	type Server as HttpServer,
} from "node:http";
import { createServer as createTcpServer, type Server as TcpServer, type Socket } from "node:net";
import { HttpStreamProvider, createTrack, type MusicConfigOptions } from "../src/index.js";
import { isPrivateNetworkAddress } from "../src/builtin/HttpStreamProvider.js";
import { createMusicClient } from "./helpers.js";

const servers = new Set<HttpServer | TcpServer>();

afterEach(async () => {
	for (const server of servers) {
		if ("closeAllConnections" in server) server.closeAllConnections();
		await new Promise<void>((resolve) => server.close(() => resolve()));
	}
	servers.clear();
});

/** 空いているポートで HTTP サーバーを起動します。 */
async function listenHttp(
	handler: RequestListener,
	host = "127.0.0.1",
): Promise<{ server: HttpServer; port: number }> {
	const server = createHttpServer(handler);
	servers.add(server);
	await new Promise<void>((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, host, resolve);
	});
	const address = server.address();
	if (!address || typeof address === "string") throw new Error("HTTP サーバーのポートを取得できません");
	return { server, port: address.port };
}

/** 接続後にヘッダーを返さない TCP サーバーを起動します。 */
async function listenStalled(): Promise<{
	server: TcpServer;
	port: number;
	requested: Promise<void>;
	sockets: Set<Socket>;
}> {
	let notifyRequest!: () => void;
	const requested = new Promise<void>((resolve) => {
		notifyRequest = resolve;
	});
	const sockets = new Set<Socket>();
	const server = createTcpServer((socket) => {
		sockets.add(socket);
		socket.once("data", notifyRequest);
		socket.once("close", () => sockets.delete(socket));
	});
	servers.add(server);
	await new Promise<void>((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
	const address = server.address();
	if (!address || typeof address === "string") throw new Error("TCP サーバーのポートを取得できません");
	return { server, port: address.port, requested, sockets };
}

async function providerFor(options: MusicConfigOptions = {}) {
	const client = createMusicClient(options);
	await client.load();
	return {
		client,
		provider: client.stores.get("providers").get("http") as HttpStreamProvider,
	};
}

describe("HTTP 音源の接続先制限", () => {
	test("IANA の非公開・特殊用途アドレスを拒否する", () => {
		for (const address of [
			"0.0.0.1",
			"10.0.0.1",
			"100.64.0.1",
			"127.0.0.1",
			"169.254.1.1",
			"172.16.0.1",
			"192.0.0.1",
			"192.0.2.1",
			"192.88.99.1",
			"192.168.0.1",
			"198.18.0.1",
			"198.51.100.1",
			"203.0.113.1",
			"224.0.0.1",
			"240.0.0.1",
			"::",
			"::1",
			"::ffff:127.0.0.1",
			"fc00::1",
			"fe80::1",
			"ff02::1",
			"2001:100::1",
			"2001:db8::1",
			"3fff::1",
		]) {
			expect(isPrivateNetworkAddress(address), address).toBe(true);
		}

		expect(isPrivateNetworkAddress("8.8.8.8")).toBe(false);
		expect(isPrivateNetworkAddress("2606:4700:4700::1111")).toBe(false);
		expect(isPrivateNetworkAddress("::ffff:8.8.8.8")).toBe(false);
	});

	test("ループバックは既定拒否する", async () => {
		const { client, provider } = await providerFor();
		try {
			const track = createTrack({ title: "内部", url: "http://127.0.0.1/audio.mp3", source: "url" });
			await expect(provider.stream(track)).rejects.toThrow("安全でないネットワークアドレス");
			// IP リテラルだけでなく、DNS 解決後に loopback となる名前も拒否する。
			const hostnameTrack = createTrack({
				title: "内部DNS",
				url: "http://localhost/audio.mp3",
				source: "url",
			});
			await expect(provider.stream(hostnameTrack)).rejects.toThrow("localhost");
		} finally {
			await client.destroy();
		}
	});

	test("privateHostAllowlist に完全一致で明示したホストだけ許可する", async () => {
		const { port } = await listenHttp((_request, response) => {
			response.writeHead(200, { "content-type": "audio/mpeg" });
			response.end("audio");
		});
		const { client, provider } = await providerFor({
			network: { privateHostAllowlist: ["127.0.0.1"] },
		});
		try {
			const audio = await provider.stream(
				createTrack({ title: "許可済み", url: `http://127.0.0.1:${port}/audio.mp3`, source: "url" }),
			);
			const chunks: Buffer[] = [];
			for await (const chunk of audio.stream) chunks.push(Buffer.from(chunk));
			expect(Buffer.concat(chunks).toString()).toBe("audio");
		} finally {
			await client.destroy();
		}
	});

	test("各リダイレクト先を再検査し、未許可の内部ホストへは追従しない", async () => {
		const requests: string[] = [];
		const { port } = await listenHttp((request, response) => {
			requests.push(request.headers.host ?? "");
			response.writeHead(302, { location: `http://127.0.0.2:${port}/audio.mp3` });
			response.end();
		}, "0.0.0.0");
		const { client, provider } = await providerFor({
			network: { privateHostAllowlist: ["127.0.0.1"] },
		});
		try {
			const track = createTrack({
				title: "リダイレクト",
				url: `http://127.0.0.1:${port}/redirect`,
				source: "url",
			});
			await expect(provider.stream(track)).rejects.toThrow("127.0.0.2");
			expect(requests).toEqual([`127.0.0.1:${port}`]);
		} finally {
			await client.destroy();
		}
	});

	test("maxRedirects を超えるリダイレクトを有限回で停止する", async () => {
		let requests = 0;
		const { port } = await listenHttp((_request, response) => {
			requests++;
			response.writeHead(302, { location: "/again" });
			response.end();
		});
		const { client, provider } = await providerFor({
			network: {
				privateHostAllowlist: ["127.0.0.1"],
				maxRedirects: 1,
			},
		});
		try {
			const track = createTrack({
				title: "循環",
				url: `http://127.0.0.1:${port}/again`,
				source: "url",
			});
			await expect(provider.stream(track)).rejects.toThrow("リダイレクト回数が上限");
			expect(requests).toBe(2);
		} finally {
			await client.destroy();
		}
	});
});

describe("HTTP 音源の中断", () => {
	test("レスポンスヘッダーが届かなければ requestTimeout で終了する", async () => {
		const { port, sockets } = await listenStalled();
		const { client, provider } = await providerFor({
			network: {
				privateHostAllowlist: ["127.0.0.1"],
				requestTimeout: 50,
			},
		});
		try {
			const track = createTrack({
				title: "応答なし",
				url: `http://127.0.0.1:${port}/audio.mp3`,
				source: "url",
			});
			await expect(provider.stream(track)).rejects.toThrow("時間内に応答");
		} finally {
			for (const socket of sockets) socket.destroy();
			await client.destroy();
		}
	});

	test("ヘッダー受信後も AbortSignal で本文ソケットを閉じる", async () => {
		let notifySocketClosed!: () => void;
		const socketClosed = new Promise<void>((resolve) => {
			notifySocketClosed = resolve;
		});
		const { server, port } = await listenHttp((_request, response) => {
			response.writeHead(200, { "content-type": "audio/mpeg" });
			// ヘッダーと本文の一部だけを送り、ストリームは閉じない。
			response.write("partial-audio");
		});
		server.once("connection", (socket) => socket.once("close", notifySocketClosed));
		const { client, provider } = await providerFor({
			network: {
				privateHostAllowlist: ["127.0.0.1"],
				requestTimeout: 5_000,
			},
		});
		const controller = new AbortController();

		try {
			const track = createTrack({
				title: "本文待機",
				url: `http://127.0.0.1:${port}/audio.mp3`,
				source: "url",
			});
			const audio = await provider.stream(track, { signal: controller.signal });
			// request の中断で IncomingMessage が ECONNRESET を出すため、
			// ここで受けて close とソケット解放を検証する。
			audio.stream.once("error", () => {});

			controller.abort();
			await Promise.race([
				socketClosed,
				Bun.sleep(500).then(() => {
					throw new Error("HTTP 本文ソケットの中断がタイムアウトしました");
				}),
			]);
			expect(audio.stream.destroyed).toBe(true);
		} finally {
			await client.destroy();
		}
	});

	test("destroy は待機中の HTTP 接続をタイムアウト前に中断する", async () => {
		const { port, requested, sockets } = await listenStalled();
		const { client } = await providerFor({
			leaveOnEnd: false,
			leaveOnEmpty: false,
			network: {
				privateHostAllowlist: ["127.0.0.1"],
				requestTimeout: 5_000,
			},
		});
		try {
			const queue = client.container.services.audio.ensureQueue("abort-guild");
			queue.add(
				createTrack({
					title: "中断対象",
					url: `http://127.0.0.1:${port}/audio.mp3`,
					source: "url",
				}),
			);
			const starting = queue.start();
			await requested;
			queue.destroy();

			await Promise.race([
				starting,
				Bun.sleep(500).then(() => {
					throw new Error("HTTP 接続の中断がタイムアウトしました");
				}),
			]);
			expect(queue.destroyed).toBe(true);
		} finally {
			for (const socket of sockets) socket.destroy();
			await client.destroy();
		}
	});

	test("skip は待機中の HTTP 接続をタイムアウト前に中断する", async () => {
		const { port, requested, sockets } = await listenStalled();
		const { client } = await providerFor({
			leaveOnEnd: false,
			leaveOnEmpty: false,
			network: {
				privateHostAllowlist: ["127.0.0.1"],
				requestTimeout: 5_000,
			},
		});
		try {
			const queue = client.container.services.audio.ensureQueue("skip-abort-guild");
			queue.add(
				createTrack({
					title: "スキップ対象",
					url: `http://127.0.0.1:${port}/audio.mp3`,
					source: "url",
				}),
			);
			const starting = queue.start();
			await requested;
			const socket = [...sockets][0];
			if (!socket) throw new Error("テスト用 HTTP ソケットが見つかりませんでした");
			const socketClosed = new Promise<void>((resolve) => socket.once("close", resolve));

			expect(queue.skip()).toBe(1);
			await Promise.race([
				Promise.all([starting, socketClosed]),
				Bun.sleep(500).then(() => {
					throw new Error("skip による HTTP 接続の中断がタイムアウトしました");
				}),
			]);
			expect(queue.current).toBeNull();
			expect(sockets.size).toBe(0);
		} finally {
			for (const socket of sockets) socket.destroy();
			await client.destroy();
		}
	});
});
