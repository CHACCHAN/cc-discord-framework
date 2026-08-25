import { Precondition, type ChatInputCommandInteraction } from "@cc-discord-framework/core";

/** OWNER_IDS のユーザーだけにコマンドを制限します。 */
export class OwnerOnlyPrecondition extends Precondition {
	override chatInputRun(interaction: ChatInputCommandInteraction) {
		return this.services.config.ownerIds.includes(interaction.user.id)
			? this.ok()
			: this.deny("このコマンドはBotのオーナーのみ使用できます。");
	}
}

declare module "@cc-discord-framework/core" {
	interface Preconditions {
		OwnerOnly: never;
	}
}
