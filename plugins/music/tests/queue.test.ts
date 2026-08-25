import { describe, expect, test } from "bun:test";
import { Readable } from "node:stream";
import {
	NoSubscriberBehavior,
	StreamType,
	VoiceConnectionStatus,
	getVoiceConnection,
} from "@discordjs/voice";
import { Client } from "@cc-discord-framework/core";
import {
	GuildQueue,
	MusicEvents,
	StreamProvider,
	TrackResolver,
	createTrack,
	defaultMusicConfig,
	music,
	type AudioStream,
	type ResolveContext,
	type Track,
} from "../src/index.js";

/**
 * 実際に音を出さずキューの遷移を検証します。`@discordjs/voice` の
 * AudioPlayer は本物なので、状態遷移は実運用と同じ経路を通ります。
 * ボイス接続を張れないぶんだけ `noSubscriberBehavior` を上書きします。
 */
function silentPcm(ms: number): Readable {
	// 48kHz ステレオ 16bit = 1ms あたり 192 バイト
	return Readable.from([Buffer.alloc(Math.max(1, Math.round(ms * 192)))]);
}

@TrackResolver.define({ name: "test", priority: 100 })
class TestResolver extends TrackResolver {
	override canResolve(query: string) {
		return query.startsWith("test:");
	}
	override resolve({ query, requestedBy }: ResolveContext): Track[] {
		// "test:a,b,c" → 3トラック
		return query
			.slice(5)
			.split(",")
			.filter(Boolean)
			.map((title) =>
				createTrack({ title, url: `test://${title}`, source: this.name, requestedBy }),
			);
	}
}

@StreamProvider.define({ name: "test", priority: 100 })
class TestProvider extends StreamProvider {
	override canStream(track: Track) {
		return track.url.startsWith("test://");
	}
	override stream(track: Track): AudioStream {
		if (track.title === "broken") throw new Error("再生できない曲");
		return { stream: silentPcm(40), type: StreamType.Raw };
	}
}

/**
 * stream() の完了をテスト側から制御するための控え。yt-dlp のように
 * 読み込みへ数秒かかるプロバイダーを再現し、その隙間への割り込み
 * (destroy / skip)を検証します。
 */
const slowLoads = new Map<string, { finish: () => void; stream: Readable }>();

@StreamProvider.define({ name: "slow", priority: 200 })
class SlowStreamProvider extends StreamProvider {
	override canStream(track: Track) {
		return track.url.startsWith("slow://");
	}
	override async stream(track: Track): Promise<AudioStream> {
		const stream = silentPcm(40);
		await new Promise<void>((finish) => slowLoads.set(track.title, { finish, stream }));
		return { stream, type: StreamType.Raw };
	}
}

async function setup() {
	const client = new Client({
		intents: [],
		baseDirectory: null,
		logger: { level: "silent" },
		plugins: [
			music({
				leaveOnEnd: false,
				leaveOnEmpty: false,
				voice: { readyTimeout: 100 },
			}),
		],
	});
	client.register(TestResolver, TestProvider, SlowStreamProvider);
	await client.load();
	const audio = client.container.services.audio;

	/** ボイス接続なしでも再生が進むキューを作る。 */
	const makeQueue = (
		guildId = "guild-1",
		options: {
			leaveOnEnd?: number | false;
			maxConsecutiveFailures?: number;
			readyTimeout?: number;
		} = {},
	) =>
		new GuildQueue({
			guildId,
			client,
			logger: client.logger,
			providers: client.stores.get("providers"),
			defaultVolume: 1,
			leaveOnEnd: options.leaveOnEnd ?? false,
			limits: {
				...defaultMusicConfig.limits,
				maxConsecutiveFailures:
					options.maxConsecutiveFailures ?? defaultMusicConfig.limits.maxConsecutiveFailures,
			},
			voice: {
				...defaultMusicConfig.voice,
				readyTimeout: options.readyTimeout ?? defaultMusicConfig.voice.readyTimeout,
				noSubscriberBehavior: NoSubscriberBehavior.Play,
			},
			onDestroy: () => {},
		});

	return { client, audio, makeQueue };
}

/** 条件が真になるまで待ちます。 */
async function waitUntil(condition: () => boolean, timeout = 2000): Promise<void> {
	const deadline = Date.now() + timeout;
	while (!condition()) {
		if (Date.now() > deadline) throw new Error("waitUntil がタイムアウトしました");
		await Bun.sleep(5);
	}
}

/** 指定イベントが発火するまで待ちます。 */
function waitFor(client: Client, event: string, timeout = 5000): Promise<unknown[]> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(
			() => reject(new Error(`${event} がタイムアウトしました`)),
			timeout,
		);
		client.once(event as never, ((...args: unknown[]) => {
			clearTimeout(timer);
			resolve(args);
		}) as never);
	});
}

describe("キュー操作", () => {
	test("追加・削除・移動・シャッフル", async () => {
		const { client, makeQueue } = await setup();
		const queue = makeQueue();
		const t = (n: string) => createTrack({ title: n, url: `test://${n}`, source: "test" });

		queue.add(t("a"), t("b"), t("c"));
		expect(queue.tracks.map((x) => x.title)).toEqual(["a", "b", "c"]);

		queue.insert(0, t("z"));
		expect(queue.tracks.map((x) => x.title)).toEqual(["z", "a", "b", "c"]);

		expect(queue.remove(1)?.title).toBe("a");
		expect(queue.remove(99)).toBeNull();
		expect(queue.tracks.map((x) => x.title)).toEqual(["z", "b", "c"]);

		expect(queue.move(0, 2)).toBe(true);
		expect(queue.tracks.map((x) => x.title)).toEqual(["b", "c", "z"]);

		queue.shuffle();
		expect([...queue.tracks].map((x) => x.title).sort()).toEqual(["b", "c", "z"]);

		queue.clear();
		expect(queue.tracks).toHaveLength(0);
		await client.destroy();
	});

	test("音量は 0〜2 に丸められる", async () => {
		const { client, makeQueue } = await setup();
		const queue = makeQueue();
		queue.volume = 5;
		expect(queue.volume).toBe(2);
		queue.volume = -1;
		expect(queue.volume).toBe(0);
		await client.destroy();
	});
});

describe("再生の流れ", () => {
	test("解決してキューへ入り、再生が始まる", async () => {
		const { client, audio, makeQueue } = await setup();
		const queue = makeQueue();
		const started = waitFor(client, MusicEvents.TrackStart);

		queue.add(...(await audio.resolve("test:one", "u1")));
		await queue.start();

		const [, track] = (await started) as [GuildQueue, Track];
		expect(track.title).toBe("one");
		expect(track.requestedBy).toBe("u1");
		expect(queue.current?.title).toBe("one");
		expect(queue.playing).toBe(true);
		queue.destroy();
		await client.destroy();
	});

	test("曲が終わると次へ進み、履歴に積まれる", async () => {
		const { client, audio, makeQueue } = await setup();
		const queue = makeQueue();
		queue.add(...(await audio.resolve("test:one,two")));
		await queue.start();
		expect(queue.current?.title).toBe("one");

		const [, second] = (await waitFor(client, MusicEvents.TrackStart)) as [GuildQueue, Track];
		expect(second.title).toBe("two");
		expect(queue.history.map((t) => t.title)).toEqual(["one"]);
		queue.destroy();
		await client.destroy();
	});

	test("キューが尽きると musicQueueEnd が発火する", async () => {
		const { client, audio, makeQueue } = await setup();
		const queue = makeQueue();
		const ended = waitFor(client, MusicEvents.QueueEnd);

		queue.add(...(await audio.resolve("test:only")));
		await queue.start();

		const [q] = (await ended) as [GuildQueue];
		expect(q).toBe(queue);
		expect(queue.playing).toBe(false);
		queue.destroy();
		await client.destroy();
	});

	test("再生できない曲は飛ばして次へ進む", async () => {
		const { client, audio, makeQueue } = await setup();
		const queue = makeQueue();
		const errors: unknown[] = [];
		client.on(MusicEvents.Error, ((error: unknown) => errors.push(error)) as never);

		queue.add(...(await audio.resolve("test:broken,good")));
		await queue.start();

		expect(queue.current?.title).toBe("good");
		expect(errors).toHaveLength(1);
		queue.destroy();
		await client.destroy();
	});

	test("連続失敗で停止して未試行トラックが残っても leaveOnEnd で破棄する", async () => {
		const { client, audio, makeQueue } = await setup();
		const queue = makeQueue("failure-leave", {
			leaveOnEnd: 20,
			maxConsecutiveFailures: 1,
		});
		queue.add(...(await audio.resolve("test:broken,untried")));

		await queue.start();
		expect(queue.tracks.map((track) => track.title)).toEqual(["untried"]);
		await waitUntil(() => queue.destroyed, 500);
		expect(queue.destroyed).toBe(true);
		await client.destroy();
	});

	test("loop: track は同じ曲を繰り返す", async () => {
		const { client, audio, makeQueue } = await setup();
		const queue = makeQueue();
		queue.loop = "track";
		queue.add(...(await audio.resolve("test:solo")));
		await queue.start();

		await waitFor(client, MusicEvents.TrackStart); // 2周目
		expect(queue.current?.title).toBe("solo");
		queue.destroy();
		await client.destroy();
	});

	test("skip は loop: track を無視して次へ進む", async () => {
		const { client, audio, makeQueue } = await setup();
		const queue = makeQueue();
		queue.loop = "track";
		queue.add(...(await audio.resolve("test:first,second")));
		await queue.start();
		expect(queue.current?.title).toBe("first");

		const next = waitFor(client, MusicEvents.TrackStart);
		queue.skip();
		await next;
		expect(queue.current?.title).toBe("second");
		queue.destroy();
		await client.destroy();
	});

	test("loop: queue は末尾へ戻す", async () => {
		const { client, audio, makeQueue } = await setup();
		const queue = makeQueue();
		queue.loop = "queue";
		queue.add(...(await audio.resolve("test:a,b")));
		await queue.start();

		await waitFor(client, MusicEvents.TrackStart); // b が開始
		expect(queue.current?.title).toBe("b");
		expect(queue.tracks.map((t) => t.title)).toEqual(["a"]);
		queue.destroy();
		await client.destroy();
	});

	test("stop でキューが空になり破棄される", async () => {
		const { client, audio, makeQueue } = await setup();
		const queue = makeQueue();
		queue.add(...(await audio.resolve("test:a,b,c")));
		await queue.start();

		queue.stop();
		expect(queue.destroyed).toBe(true);
		expect(queue.tracks).toHaveLength(0);
		await client.destroy();
	});
});

describe("開けたのに再生できなかったストリームの後始末", () => {
	test("open 成功後の同期 throw でもストリームは破棄される", async () => {
		const { client, makeQueue } = await setup();
		const stream = silentPcm(40);

		// open は成功するが、そのあとの createAudioResource が
		// `type` を読んだ瞬間に throw する — というプロバイダー。
		@StreamProvider.define({ name: "poison", priority: 300 })
		class PoisonProvider extends StreamProvider {
			override canStream(track: Track) {
				return track.url.startsWith("poison://");
			}
			override stream(): AudioStream {
				return {
					stream,
					get type(): StreamType {
						throw new Error("open のあとで壊れる");
					},
				};
			}
		}
		// register() は load 済みストアでは fire-and-forget なので、
		// レースを避けるためストアの load を直接 await する。
		await client.stores.get("providers").load(PoisonProvider);

		const queue = makeQueue();
		queue.add(
			createTrack({ title: "毒", url: "poison://x", source: "poison", requestedBy: null }),
		);
		const errored = waitFor(client, MusicEvents.Error);
		await queue.start();
		await errored;

		// 失敗として報告されつつ、開いたストリームは閉じられている
		// (閉じ忘れると yt-dlp / ffmpeg の子プロセスが積み上がる)。
		await waitUntil(() => stream.destroyed);
		queue.destroy();
		await client.destroy();
	});
});

describe("skip の戻り値", () => {
	test("残りが足りないときは、実際に飛ばした数を返す", async () => {
		const { client, makeQueue } = await setup();
		const queue = makeQueue();
		const [a, b, c] = ["a", "b", "c"].map((title) =>
			createTrack({ title, url: `test://${title}`, source: "test", requestedBy: null }),
		);
		queue.add(a as Track);
		await queue.start();
		await waitUntil(() => queue.current !== null);
		queue.add(b as Track, c as Track);

		// 再生中1曲 + キュー2曲 = 3曲しか無いのに 10 を指定。
		expect(queue.skip(10)).toBe(3);
		queue.destroy();
		await client.destroy();
	});

	test("破棄済みキューでは 0 を返す", async () => {
		const { client, makeQueue } = await setup();
		const queue = makeQueue();
		queue.destroy();
		expect(queue.skip(5)).toBe(0);
		await client.destroy();
	});
});

describe("読み込み中の割り込み", () => {
	const slowTrack = (title: string) =>
		createTrack({ title, url: `slow://${title}`, source: "slow" });

	test("読み込み中に destroy されたら再生を始めず、ストリームを閉じる", async () => {
		const { client, makeQueue } = await setup();
		const queue = makeQueue();
		const starts: string[] = [];
		client.on(MusicEvents.TrackStart, ((_q: GuildQueue, track: Track) =>
			starts.push(track.title)) as never);

		queue.add(slowTrack("s1"));
		const starting = queue.start();
		await waitUntil(() => slowLoads.has("s1"));

		// 読み込みが終わる前に /stop 相当の破棄が入る。
		queue.destroy();
		const load = slowLoads.get("s1")!;
		load.finish();
		await starting;

		expect(starts).toEqual([]);
		expect(queue.current).toBeNull();
		// 誰も消費しないストリームは閉じられる(子プロセスの後始末に繋がる)。
		expect(load.stream.destroyed).toBe(true);
		await client.destroy();
	});

	test("読み込み中に skip されたら次の曲へ進み、loop: track も壊れない", async () => {
		const { client, audio, makeQueue } = await setup();
		const queue = makeQueue();
		const starts: string[] = [];
		client.on(MusicEvents.TrackStart, ((_q: GuildQueue, track: Track) =>
			starts.push(track.title)) as never);

		queue.add(slowTrack("s2"));
		queue.add(...(await audio.resolve("test:after")));
		queue.loop = "track";

		const starting = queue.start();
		await waitUntil(() => slowLoads.has("s2"));

		// 読み込みが終わる前にスキップが入る。player.stop() はまだ何も
		// 再生していないので効かず、修正前は s2 がそのまま鳴っていた。
		queue.skip();
		const load = slowLoads.get("s2")!;
		load.finish();
		await starting;

		expect(starts).not.toContain("s2");
		expect(starts[0]).toBe("after");
		expect(queue.current?.title).toBe("after");
		expect(load.stream.destroyed).toBe(true);

		// skip() が立てたフラグが漏れず、loop: "track" は次の曲で生きている。
		await waitFor(client, MusicEvents.TrackStart);
		expect(queue.current?.title).toBe("after");

		queue.destroy();
		await client.destroy();
	});
});

describe("サービスのライフサイクル", () => {
	test("client.destroy() で全キューが破棄される", async () => {
		const { client, audio } = await setup();
		const q1 = audio.ensureQueue("g1");
		const q2 = audio.ensureQueue("g2");

		await client.destroy();
		expect(q1.destroyed).toBe(true);
		expect(q2.destroyed).toBe(true);
		expect(audio.queues).toHaveLength(0);
	});

	test("破棄されたキューは ensureQueue で作り直される", async () => {
		const { client, audio } = await setup();
		const first = audio.ensureQueue("g1");
		first.destroy();
		const second = audio.ensureQueue("g1");
		expect(second).not.toBe(first);
		expect(second.destroyed).toBe(false);
		await client.destroy();
	});

	test("解決できないクエリは NoResultError", async () => {
		const { client, audio } = await setup();
		expect(
			audio.play({
				channel: { id: "c", guild: { id: "g" } } as never,
				query: "解決できない文字列",
			}),
		).rejects.toThrow(/見つかりませんでした/);
		await client.destroy();
	});
});

describe("ボイス接続のライフサイクル", () => {
	/** Gateway を使わず VoiceConnection の状態遷移だけを検証するチャンネル。 */
	function voiceChannel(guildId: string, channelId: string) {
		return {
			id: channelId,
			guild: {
				id: guildId,
				voiceAdapterCreator: () => ({
					sendPayload: () => true,
					destroy: () => {},
				}),
			},
		} as never;
	}

	test("Ready 待機に失敗した接続を残さず、同じチャンネルでも再試行する", async () => {
		const { client, makeQueue } = await setup();
		const guildId = "connection-retry";
		const queue = makeQueue(guildId, { readyTimeout: 20 });
		const channel = voiceChannel(guildId, "voice-a");

		await expect(queue.connect(channel)).rejects.toThrow();
		expect(queue.voiceChannelId).toBeNull();
		// 修正前は同一 channelId の早期 return で成功扱いになっていた。
		await expect(queue.connect(channel)).rejects.toThrow();
		expect(queue.voiceChannelId).toBeNull();

		queue.destroy();
		await client.destroy();
	});

	test("接続試行中は別チャンネルからの後発 connect を拒否する", async () => {
		const { client, makeQueue } = await setup();
		const guildId = "connection-concurrent";
		const queue = makeQueue(guildId, { readyTimeout: 50 });
		const first = queue.connect(voiceChannel(guildId, "voice-a"));
		await waitUntil(() => getVoiceConnection(guildId) !== undefined);
		expect(queue.connect(voiceChannel(guildId, "voice-a"))).toBe(first);

		await expect(queue.connect(voiceChannel(guildId, "voice-b"))).rejects.toThrow(
			"Botと同じボイスチャンネル",
		);
		expect(queue.voiceChannelId).toBe("voice-a");

		queue.destroy();
		await expect(first).rejects.toThrow();
		await client.destroy();
	});

	test("破棄済みキューは再接続しない", async () => {
		const { client, makeQueue } = await setup();
		const guildId = "connection-destroyed";
		const queue = makeQueue(guildId, { readyTimeout: 20 });
		queue.destroy();

		await expect(queue.connect(voiceChannel(guildId, "voice-a"))).rejects.toThrow(
			"何も再生していません",
		);
		expect(getVoiceConnection(guildId)).toBeUndefined();
		await client.destroy();
	});

	test("並行 play の別チャンネル側を、トラック追加前に拒否する", async () => {
		const { client, audio } = await setup();
		const guildId = "play-concurrent";
		const first = audio.play({
			channel: voiceChannel(guildId, "voice-a"),
			query: "test:first",
		});
		await waitUntil(() => getVoiceConnection(guildId) !== undefined);

		await expect(
			audio.play({
				channel: voiceChannel(guildId, "voice-b"),
				query: "test:intruder",
			}),
		).rejects.toThrow("Botと同じボイスチャンネル");
		const queue = audio.queue(guildId);
		if (!queue) throw new Error("テスト用キューが作成されませんでした");
		// 先行側も接続待ちなのでまだ追加前。後発側だけが紛れ込むこともない。
		expect(queue.tracks).toEqual([]);

		queue.destroy();
		await expect(first).rejects.toThrow();
		await client.destroy();
	});

	test("チャンネル移動で再利用された接続へ Disconnected リスナーを重複登録しない", async () => {
		const { client, makeQueue } = await setup();
		const guildId = "connection-listener";
		const queue = makeQueue(guildId, { readyTimeout: 100 });
		const firstConnect = queue.connect(voiceChannel(guildId, "voice-a"));
		await Bun.sleep(0);

		const connection = getVoiceConnection(guildId);
		if (!connection) throw new Error("テスト用 VoiceConnection が作成されませんでした");
		connection.state = { ...connection.state, status: VoiceConnectionStatus.Ready } as never;
		await firstConnect;
		expect(connection.listenerCount(VoiceConnectionStatus.Disconnected)).toBe(1);

		await queue.connect(voiceChannel(guildId, "voice-b"));
		expect(getVoiceConnection(guildId)).toBe(connection);
		expect(connection.listenerCount(VoiceConnectionStatus.Disconnected)).toBe(1);

		queue.destroy();
		expect(connection.listenerCount(VoiceConnectionStatus.Disconnected)).toBe(0);
		await client.destroy();
	});
});
