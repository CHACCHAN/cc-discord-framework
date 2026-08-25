import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rename, rm, symlink, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	LocalFileResolver,
	LocalFileStreamProvider,
	type Track,
} from "../src/index.js";
import { createMusicClient } from "./helpers.js";

const temporaryRoots = new Set<string>();

afterEach(async () => {
	for (const root of temporaryRoots) await rm(root, { recursive: true, force: true });
	temporaryRoots.clear();
});

async function fixtures() {
	const root = await mkdtemp(join(tmpdir(), "cc-music-local-"));
	temporaryRoots.add(root);
	const allowed = join(root, "allowed");
	const outside = join(root, "outside");
	await mkdir(allowed);
	await mkdir(outside);
	return { root, allowed, outside };
}

async function components(allowed: string) {
	const client = createMusicClient({ localDirectories: [allowed] });
	await client.load();
	return {
		client,
		resolver: client.stores.get("resolvers").get("local") as LocalFileResolver,
		provider: client.stores.get("providers").get("local") as LocalFileStreamProvider,
	};
}

async function resolveOne(resolver: LocalFileResolver, query: string): Promise<Track> {
	const [track] = await resolver.resolve({ query, requestedBy: null });
	if (!track) throw new Error("テスト用ローカルトラックを解決できませんでした");
	return track;
}

describe("ローカル音源の再生直前検証", () => {
	test("検証後にファイル自身を外部への symlink に差し替えても開かない", async () => {
		const { allowed, outside } = await fixtures();
		const candidate = join(allowed, "song.mp3");
		const secret = join(outside, "secret.mp3");
		await writeFile(candidate, "safe");
		await writeFile(secret, "secret");
		const { client, resolver, provider } = await components(allowed);
		try {
			const track = await resolveOne(resolver, "song.mp3");
			await unlink(candidate);
			await symlink(secret, candidate);

			await expect(provider.stream(track)).rejects.toThrow("アクセスは許可されていません");
		} finally {
			await client.destroy();
		}
	});

	test("親ディレクトリを symlink に差し替えても、開いた fd の実体を拒否する", async () => {
		const { allowed, outside } = await fixtures();
		const subdirectory = join(allowed, "album");
		const moved = join(allowed, "album-old");
		await mkdir(subdirectory);
		await writeFile(join(subdirectory, "song.mp3"), "safe");
		await writeFile(join(outside, "song.mp3"), "secret");
		const { client, resolver, provider } = await components(allowed);
		try {
			const track = await resolveOne(resolver, "album/song.mp3");
			await rename(subdirectory, moved);
			await symlink(outside, subdirectory, "dir");

			await expect(provider.stream(track)).rejects.toThrow("アクセスは許可されていません");
		} finally {
			await client.destroy();
		}
	});

	test("検証した通常ファイルは、同じ fd から読み出す", async () => {
		const { allowed } = await fixtures();
		await writeFile(join(allowed, "song.mp3"), "audio-data");
		const { client, resolver, provider } = await components(allowed);
		try {
			const track = await resolveOne(resolver, "song.mp3");
			const audio = await provider.stream(track);
			const chunks: Buffer[] = [];
			for await (const chunk of audio.stream) chunks.push(Buffer.from(chunk));
			expect(Buffer.concat(chunks).toString()).toBe("audio-data");
		} finally {
			await client.destroy();
		}
	});
});
