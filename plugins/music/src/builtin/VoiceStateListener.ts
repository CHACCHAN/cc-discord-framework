import { Events, Listener } from "@cc-discord-framework/core";
import type { Guild, VoiceState } from "discord.js";

/**
 * ボイスチャンネルが無人になったら自動的に切断します。
 * `music({ leaveOnEmpty: false })` を指定した場合は登録されません。
 */
@Listener.define({ name: "music-voice-state", event: Events.VoiceStateUpdate })
export class VoiceStateListener extends Listener<Events.VoiceStateUpdate> {
	readonly #timers = new Map<string, ReturnType<typeof setTimeout>>();

	override run(oldState: VoiceState, newState: VoiceState): void {
		const delay = this.container.musicConfig.leaveOnEmpty;
		if (delay === false) return;

		const guildId = oldState.guild.id;
		const queue = this.services.audio.queue(guildId);
		if (!queue || queue.destroyed) {
			// 生きているキューが無いギルドでは、前のセッションが残した
			// タイマーを必ず解除する。残しておくと、あとから作られた
			// 別のセッションを発火時に巻き込んでしまう。
			this.#clear(guildId);
			return;
		}

		const channelId = queue.voiceChannelId;
		if (!channelId) {
			// キューはあるが未接続。接続していた頃のタイマーはもう無効。
			this.#clear(guildId);
			return;
		}
		// このキューが接続中のチャンネルに関係する変化だけを見る。
		if (oldState.channelId !== channelId && newState.channelId !== channelId) return;

		this.#clear(guildId);
		if (this.#countHumans(oldState.guild, channelId) > 0) return;

		this.#timers.set(
			guildId,
			setTimeout(() => {
				this.#timers.delete(guildId);
				// タイマー設定時とは状況が変わっているかもしれないので、
				// 発火時点のキューと在室状況を確認し直してから切断する。
				const current = this.services.audio.queue(guildId);
				if (!current || current.destroyed) return;
				const currentChannelId = current.voiceChannelId;
				if (!currentChannelId) return;
				if (this.#countHumans(oldState.guild, currentChannelId) > 0) return;
				this.logger.debug({ guildId }, "ボイスチャンネルが無人のため切断します");
				current.destroy();
			}, delay),
		);
	}

	override onUnload(): void {
		for (const timer of this.#timers.values()) clearTimeout(timer);
		this.#timers.clear();
	}

	/** チャンネルに残っている人間(Bot 以外)の数。 */
	#countHumans(guild: Guild, channelId: string): number {
		const channel = guild.channels.cache.get(channelId);
		return channel?.isVoiceBased()
			? channel.members.filter((member) => !member.user.bot).size
			: 0;
	}

	#clear(guildId: string): void {
		const timer = this.#timers.get(guildId);
		if (timer) {
			clearTimeout(timer);
			this.#timers.delete(guildId);
		}
	}
}
