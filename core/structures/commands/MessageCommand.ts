import { type Message } from "discord.js";
import { Base, BaseApplyDecorator } from "../Base";

export interface PreconditionRegistry {}

type NoSpace<S extends string> = S extends `${string} ${string}` 
    ? "Error: Name must not contain spaces" 
    : S;

interface Options<T extends string> {
    name: NoSpace<T>;
    description?: string;
    aliases?: string[];
    preconditions?: (keyof PreconditionRegistry)[];
}

export const MESSAGE_COMMAND_METADATA_KEY = "Command:MessageCommand";
export function ApplyMessageCommand<T extends string>(options: Options<T>): ClassDecorator {
    return BaseApplyDecorator(MESSAGE_COMMAND_METADATA_KEY, options);
}

export abstract class MessageCommand extends Base {
    public abstract run(message: Message, args: string[]): Promise<unknown>;
}