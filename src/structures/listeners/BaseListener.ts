import { type ClientEvents } from "discord.js";
import { Base, BaseApplyDecorator } from "../Base.js";

interface ListenerOptions<K extends keyof ClientEvents> {
    eventName: K;
    once?: boolean; 
}

export const BASE_LISTENER_METADATA_KEY = "Listener";
export function ApplyListener<K extends keyof ClientEvents>(options: ListenerOptions<K>): ClassDecorator {
    return BaseApplyDecorator(BASE_LISTENER_METADATA_KEY, options);
}

export abstract class BaseListener<K extends keyof ClientEvents> extends Base {
    public abstract run(...args: ClientEvents[K]): Promise<unknown> | unknown;
}