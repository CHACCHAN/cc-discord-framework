/**
 * 音楽コマンドが共有する小さなヘルパー。
 *
 * ファイル名が `_` で始まるため、コンポーネントとしては読み込まれません
 * (ディレクトリ名を `_` で始めた場合も同じく丸ごとスキップされます)。
 * 文言はここも含めてすべてリテラルです — 直したくなったら書き換えて
 * ください(設定機構は作っていません)。
 */
import {
	MusicError,
	NotPlayingError,
	musicConfigOf,
	type AudioService,
	type GuildQueue,
	type LoopMode,
	type Track,
} from "@cc-discord-framework/music";
import { formatDuration, truncate } from "@cc-discord-framework/utils";
import { ChannelType, type ChatInputCommandInteraction, type VoiceBasedChannel } from "cc-discord-framework";

/** 何も再生していないときの言い回し(複数のコマンドで揃えるため)。 */
export const NOTHING_PLAYING = "現在このサーバーでは何も再生していません。";

/** ループの表示名。`/loop` の選択肢と `/queue`・`/nowplaying` の表示で共有します。 */
export const LOOP_LABELS: Record<LoopMode, string> = {
	off: "オフ",
	track: "1曲リピート",
	queue: "キュー全体リピート",
};

/** 呼び出したメンバーが参加中のボイスチャンネル。いなければユーザー向けエラー。 */
export function requireVoiceChannel(interaction: ChatInputCommandInteraction): VoiceBasedChannel {
	if (!interaction.inCachedGuild()) {
		throw new MusicError("このコマンドはサーバー内でのみ使用できます。");
	}
	const channel = interaction.member.voice.channel;
	if (!channel) throw new MusicError("先にボイスチャンネルへ参加してください。");
	// ステージチャンネルでは、スピーカー権限を持たない Bot は聴衆のまま
	// 無音になる(参加自体は成功してしまうので「再生します」が嘘になる)。
	// この Bot はステージ運用を想定していないため、正直に断る。
	if (channel.type === ChannelType.GuildStageVoice) {
		throw new MusicError("ステージチャンネルでは再生できません。通常のボイスチャンネルから使ってください。");
	}
	return channel;
}

/**
 * `/play` の接続先。すでに Bot のキューが接続中なら、別チャンネルから
 * 接続先を横取りできないよう同じチャンネルだけを許可します。
 */
export function requirePlaybackVoiceChannel(
	audio: AudioService,
	interaction: ChatInputCommandInteraction,
): VoiceBasedChannel {
	const channel = requireVoiceChannel(interaction);
	const queue = audio.queue(interaction.guildId!);
	if (
		queue &&
		!queue.destroyed &&
		queue.voiceChannelId !== null &&
		queue.voiceChannelId !== channel.id
	) {
		throw new MusicError(musicConfigOf(interaction).texts.voiceChannelMismatch);
	}
	return channel;
}

/**
 * 操作対象のキュー。再生していない場合と、Bot と別のチャンネルから
 * 操作された場合はユーザー向けエラーになります。
 */
export function requireQueue(
	audio: AudioService,
	interaction: ChatInputCommandInteraction,
): GuildQueue {
	if (!interaction.inCachedGuild()) {
		throw new MusicError("このコマンドはサーバー内でのみ使用できます。");
	}

	const queue = audio.queue(interaction.guildId);
	if (!queue || queue.destroyed) throw new NotPlayingError(NOTHING_PLAYING);

	// 別のチャンネルにいる人が横から止めてしまわないようにする。
	const memberChannelId = interaction.member.voice.channelId;
	if (queue.voiceChannelId !== null && memberChannelId !== queue.voiceChannelId) {
		throw new MusicError(musicConfigOf(interaction).texts.voiceChannelMismatch);
	}
	return queue;
}

/** トラックを1行で表します(題名が長い場合は切り詰めます)。 */
export function describeTrack(track: Track): string {
	const duration = track.duration === null ? "ライブ" : formatDuration(track.duration);
	return `**${truncate(track.title, 80)}**(${duration})`;
}
