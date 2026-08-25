import { describe, expect, test } from "bun:test";
import type { AudioService } from "@cc-discord-framework/music";
import { ChannelType, type ChatInputCommandInteraction } from "cc-discord-framework";
import { requirePlaybackVoiceChannel } from "../src/commands/music/_shared.js";

function interaction(channelId: string): ChatInputCommandInteraction {
	const channel = { id: channelId, type: ChannelType.GuildVoice };
	return {
		guildId: "guild-1",
		inCachedGuild: () => true,
		member: { voice: { channel, channelId } },
	} as unknown as ChatInputCommandInteraction;
}

function audioWithQueue(voiceChannelId: string | null, destroyed = false): AudioService {
	return {
		queue: () => ({ voiceChannelId, destroyed }),
	} as unknown as AudioService;
}

describe("/play のボイスチャンネル制約", () => {
	test("既存キューと同じチャンネルなら許可する", () => {
		const channel = requirePlaybackVoiceChannel(
			audioWithQueue("voice-a"),
			interaction("voice-a"),
		);
		expect(channel.id).toBe("voice-a");
	});

	test("既存キューと別のチャンネルからの横取りを拒否する", () => {
		expect(() =>
			requirePlaybackVoiceChannel(audioWithQueue("voice-a"), interaction("voice-b")),
		).toThrow("Botと同じボイスチャンネル");
	});

	test("未接続または破棄済みのキューは新しい接続を妨げない", () => {
		expect(requirePlaybackVoiceChannel(audioWithQueue(null), interaction("voice-b")).id).toBe(
			"voice-b",
		);
		expect(
			requirePlaybackVoiceChannel(audioWithQueue("voice-a", true), interaction("voice-b")).id,
		).toBe("voice-b");
	});
});
