import type { GuildQueue, Track } from "@cc-discord-framework/music";
import { Listener } from "@cc-discord-framework/core";

/**
 * 再生中のエラーを、その曲を頼んだチャンネルへ知らせます。
 *
 * music プラグインは `musicError` を **発火するだけ** で、勝手にメッセージを
 * 送りません。再生の失敗は `/play` の応答が返ったあとに起きることもあるため、
 * ここで拾わないとユーザーには「無言で次の曲へ進んだ」ようにしか見えません。
 *
 * 通知先は `queue.textChannel` — `/play` が
 * `textChannel: interaction.channel` を渡しているので、コマンドを打った
 * チャンネルになります。
 */
@Listener.define({ event: "musicError" })
export class MusicErrorListener extends Listener<"musicError"> {
	override async run(error: unknown, queue: GuildQueue, track: Track | null) {
		const channel = queue.textChannel;
		// 通知先が判らない・送れない場合は、エンジン側のログだけで済ませる。
		if (!channel?.isSendable()) return;

		const reason = error instanceof Error ? error.message : String(error);
		const body = track === null ? reason : `「${track.title}」を再生できませんでした。\n${reason}`;

		await channel.send({
			embeds: [this.services.ui.error(body)],
			allowedMentions: { parse: [] },
		});
	}
}
