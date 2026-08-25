import { Events, Listener, type Client } from "@cc-discord-framework/core";

@Listener.define({ event: Events.ClientReady, once: true })
export class ReadyListener extends Listener<Events.ClientReady> {
	override run(client: Client<true>) {
		this.logger.info({ tag: client.user.tag }, "Botの準備が完了しました");
	}
}
