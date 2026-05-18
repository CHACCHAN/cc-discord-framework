import type { ClientEvents } from "discord.js";
import type { Core } from "../core.js";

export interface CorePlugin {
    name: string;
    
    events: {
        [K in keyof ClientEvents]?: (...args: ClientEvents[K]) => void | Promise<void>;
    }

    install?: (core: Core) => void | Promise<void>;
}