import { ActivityType, Events, Listener, type Client } from "@cc-discord-framework/core";

@Listener.define({ event: Events.ClientReady, once: true })
export class ReadyListener extends Listener<Events.ClientReady> {
	override run(client: Client<true>) {
		client.user.setPresence({
			activities: [{
				name: "取り込み中",
				type: ActivityType.Watching
			}],
			status: "dnd"
		});

		this.logger.info({ tag: client.user.tag }, "Botの準備が完了しました");
	}
}
