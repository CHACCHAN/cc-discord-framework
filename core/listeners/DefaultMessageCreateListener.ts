import { BaseListener, MESSAGE_COMMAND_METADATA_KEY, MESSAGE_CREATE_PRECONDITION_METADATA_KEY } from "@core/structures/index.js";
import type { Events, Message } from "discord.js";
import { Logger } from "@core/utils/index.js";

export class DefaultMessageCreateListener extends BaseListener<Events.MessageCreate> {
    public async run(message: Message) {
        const core = this.container.get('Core');

        if (message.author.bot) return;
        await this.execute(message); // カスタムロジック呼び出し

        if (!message.content.startsWith(core.prefix)) return;

        // コマンド判定
        const args = message.content.slice(core.prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();
        if (commandName) this.command(message, args, commandName);
    }

    private async command(message: Message, args: string[], commandName: string) {
        const command = this.container.get(
            `${MESSAGE_COMMAND_METADATA_KEY}:${commandName}` as any
        );

        if (!command) return;

        try {
            // 前提条件
            const preconditions = command?.preconditions ?? [];
            for (const p of preconditions) {
                const instance = this.container.get(
                    `${MESSAGE_CREATE_PRECONDITION_METADATA_KEY}:${p}` as any
                );
                const result = await instance.run(message);
                if (!result) {
                    instance.error(message);
                    return;
                }
            }

            // 実行
            await command.run(message, args);

        } catch (error) {
            Logger.error(error);
        }
    }

    protected async execute(message: Message): Promise<void> {}
}