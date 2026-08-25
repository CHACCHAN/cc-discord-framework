/**
 * AI ツールのサンプル。
 *
 * **`src/ai/` にクラスを置くだけ** で、モデルから呼べる関数になります
 * (登録も配線も不要 — ai プラグインが `ai/` を自動で読みます)。
 *
 * ツールの中では他のコンポーネントとまったく同じように
 * `this.services.*` / `this.container` / `this.logger` が使えるので、
 * Bot が既に持っている機能をそのまま AI へ開放できます。ここでは music
 * プラグインの `this.services.audio` を覗いて、再生中の曲を答えています。
 *
 * `/chat` で「いま何の曲?」と聞くと、モデルがこのツールを呼びます。
 */
import { AiTool, type AiToolContext } from "@cc-discord-framework/ai";
import { z } from "zod";

const input = z.object({
	キュー: z.boolean().optional().describe("待機中の曲を題名の一覧で返すかどうか"),
});

@AiTool.define({
	description:
		"このサーバーで再生中の曲と、待機中の曲の状況を返します。音楽の再生状況を聞かれたら使ってください。",
	inputSchema: input,
	// 再生キューはサーバー単位なので、DM からの呼び出しでは使わせない。
	guildOnly: true,
})
export class NowPlayingTool extends AiTool<z.infer<typeof input>> {
	override execute({ キュー = false }: z.infer<typeof input>, context: AiToolContext) {
		// guildOnly: true なので context.guildId は基本的に埋まっているが、
		// 型のうえでは null を取りうるので素直に確かめる。
		const queue = context.guildId === null ? null : this.services.audio.queue(context.guildId);
		if (!queue?.current) return { 再生中: null, 待機中: 0 };

		return {
			再生中: { 題名: queue.current.title, 演者: queue.current.author },
			待機中: キュー ? queue.tracks.map((track) => track.title) : queue.tracks.length,
		};
	}
}
