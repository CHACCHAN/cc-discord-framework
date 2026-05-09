import type { Message } from "discord.js";
import { Base, BaseApplyDecorator } from "../Base";

interface Options {
    name: string;
}

export const MESSAGE_CREATE_PRECONDITION_METADATA_KEY = "Precondition:MessageCreate";
export function ApplyMessageCreatePrecondition(options: Options): ClassDecorator {
    return BaseApplyDecorator(MESSAGE_CREATE_PRECONDITION_METADATA_KEY, options);
}

export abstract class MessageCreatePrecondition extends Base {
    public abstract run(message: Message): Promise<boolean>;
    public abstract error(message: Message): Promise<void>;
}