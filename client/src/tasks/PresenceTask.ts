import { ActivityType } from "@cc-discord-framework/core";
import { Task } from "@cc-discord-framework/utils";

/** 公式 utils プラグインが追加する Task 種別のコンポーネント。 */
@Task.define({ every: "5m", runOnStart: true })
export class PresenceTask extends Task {
	override run() {
		this.client.user?.setPresence({
			activities: [{ type: ActivityType.Playing, name: "/help" }],
		});
	}
}
