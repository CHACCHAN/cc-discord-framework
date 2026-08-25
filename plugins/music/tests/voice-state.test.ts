import { describe, expect, test } from "bun:test";
import { Collection } from "discord.js";
import type { VoiceState } from "discord.js";
import type { GuildQueue } from "../src/index.js";
import { VoiceStateListener } from "../src/builtin/VoiceStateListener.js";
import { createMusicClient } from "./helpers.js";

/** テストで使う leaveOnEmpty(ミリ秒)。 */
const DELAY = 50;

/** タイマーが発火し終わるまで待つ長さ。 */
const AFTER_DELAY = DELAY + 50;

/**
 * ボイスチャンネル1つ分の偽ギルド。`members` を書き換えることで
 * 在室状況(人間の入退室)を再現できます。
 */
function createFixtures(guildId = "g1", channelId = "vc") {
	const members = new Collection<string, { user: { bot: boolean } }>();
	// Bot 自身は常に居る(人間だけを数えることの検証も兼ねる)。
	members.set("bot", { user: { bot: true } });
	const channel = { isVoiceBased: () => true, members };
	const guild = { id: guildId, channels: { cache: new Map([[channelId, channel]]) } };
	// 「人間がチャンネルから退出した」イベント相当。
	const oldState = { guild, channelId } as unknown as VoiceState;
	const newState = { guild, channelId: null } as unknown as VoiceState;
	return { guild, members, oldState, newState };
}

async function setup() {
	const client = createMusicClient({ leaveOnEmpty: DELAY, leaveOnEnd: false });
	await client.load();
	const audio = client.container.services.audio;
	const listener = client.stores.get("listeners").get("music-voice-state") as VoiceStateListener;

	/** 指定チャンネルへ「接続済み」のキューを作る(実接続は張らない)。 */
	const makeQueue = (guildId = "g1", channelId = "vc"): GuildQueue => {
		const queue = audio.ensureQueue(guildId);
		Object.defineProperty(queue, "voiceChannelId", {
			get: () => channelId,
			configurable: true,
		});
		return queue;
	};

	return { client, audio, listener, makeQueue };
}

describe("leaveOnEmpty のタイマー", () => {
	test("無人のままなら delay 後に切断される", async () => {
		const { client, listener, makeQueue } = await setup();
		const { oldState, newState } = createFixtures();
		const queue = makeQueue();

		listener.run(oldState, newState);
		await Bun.sleep(AFTER_DELAY);

		expect(queue.destroyed).toBe(true);
		await client.destroy();
	});

	test("人間が残っていればタイマーを張らない", async () => {
		const { client, listener, makeQueue } = await setup();
		const { members, oldState, newState } = createFixtures();
		members.set("human", { user: { bot: false } });
		const queue = makeQueue();

		listener.run(oldState, newState);
		await Bun.sleep(AFTER_DELAY);

		expect(queue.destroyed).toBe(false);
		await client.destroy();
	});

	test("キューが無いギルドのイベントで古いタイマーが解除される", async () => {
		const { client, listener, makeQueue } = await setup();
		const { oldState, newState } = createFixtures();

		// セッション1: 無人になりタイマーが張られる。
		const first = makeQueue();
		listener.run(oldState, newState);

		// タイマー発火前に /stop 相当で破棄され、その後イベントが届く。
		// 生きているキューが無いので、ここで古いタイマーが解除されるべき。
		first.destroy();
		listener.run(oldState, newState);

		// セッション2: チャンネルはまだ無人だが、このセッションの無人化は
		// まだ観測されていない(タイマーは張られていない)。
		const second = makeQueue();
		await Bun.sleep(AFTER_DELAY);

		// 古いタイマーが残っていると second が巻き込まれて破棄される。
		expect(second.destroyed).toBe(false);
		await client.destroy();
	});

	test("発火時に在室状況を確認し直し、人間が居れば切断しない", async () => {
		const { client, listener, makeQueue } = await setup();
		const { members, oldState, newState } = createFixtures();

		// セッション1: 無人になりタイマーが張られる。
		const first = makeQueue();
		listener.run(oldState, newState);

		// イベントが届かないままセッション1が破棄され、
		// 人間の居るチャンネルで新しいセッションが始まる。
		first.destroy();
		const second = makeQueue();
		members.set("human", { user: { bot: false } });
		await Bun.sleep(AFTER_DELAY);

		// 古いタイマーは発火するが、確認し直して何もしないのが正しい。
		expect(second.destroyed).toBe(false);
		await client.destroy();
	});
});
