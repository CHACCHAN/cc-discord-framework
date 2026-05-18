import { Client, Events, Message, type ClientEvents, type ClientOptions } from "discord.js";
import { Container } from "./registry/index.js";
import { FileLoader, Logger } from "./utils/index.js";
import * as Structures from "./structures/index.js";
import { DefaultMessageCreateListener } from "./listeners/index.js";
import type { CorePlugin } from "./types/CorePlugin.js";

interface CoreOptions extends ClientOptions {
    defaultPrefix: string;
    basePath: string;
    plugins?: CorePlugin[];
}

interface InitOptions {
    awake?: () => Promise<void> | void;
    start?: (bootstrap: (extraTasks?: Promise<void>[]) => Promise<void>) => Promise<void> | void;
    end?: (login: (token: string) => Promise<void>) => Promise<void> | void;
}

export class Core extends Client {
    public readonly prefix: string;
    public readonly basePath: string;

    private plugins: CorePlugin[] | null;
    private eventDispatcher = new Map<keyof ClientEvents, { once: boolean, callback: Function }[]>();

    constructor(options: CoreOptions) {
        super(options);
        this.prefix = options.defaultPrefix;
        this.basePath = options.basePath;
        
        this.plugins = options?.plugins || null;

        Container.register("Core", this);
    }

    // init framework core
    public async init(options: InitOptions): Promise<Core> {
        try {
            // init setup
            await options.awake?.();
            await options.start?.(async (extraTasks) => {
                await this.bootstrap(extraTasks);
            });
            await options.end?.(async (token: string) => {
                await this.login(token);
            });

            return this;

        } catch (error) {
            Logger.error(error);
            process.exit(1);
        }
    }

    // listener registration including plugins
    public registrationListener<K extends keyof ClientEvents>(
        eventName: K,
        listener: (...args: ClientEvents[K]) => void | Promise<void>,
        once: boolean = false
    ): void {
        if (!this.eventDispatcher.has(eventName)) {
            this.eventDispatcher.set(eventName, []);

            this.on(eventName, async (...args) => {
                const callbacks = this.eventDispatcher.get(eventName) || [];
                const nextCallbacks = [];

                for (const { once, callback } of callbacks) {
                    try {
                        await callback(...args);

                    } catch (error) {
                        Logger.error(error);
                    }

                    if (!once) nextCallbacks.push({ once, callback });
                }
                this.eventDispatcher.set(eventName, nextCallbacks);
            });

            this.eventDispatcher.get(eventName)!.push({ once, callback: listener });
        }
    }

    // this framework starts an ecosystem
    private async bootstrap(extraTasks: Promise<void>[] = []) {
        // load plugins
        const everyEventPlugins: {
            [K in keyof ClientEvents]?: Array<(...args: ClientEvents[K]) => void | Promise<void>>
        } = {};

        if (this.plugins && this.plugins.length > 0) {
            for (const plugin of this.plugins) {
                if (!plugin.events) continue;

                for (const [eventName, listener] of Object.entries(plugin.events)) {
                    const key = eventName as keyof ClientEvents;

                    if (!everyEventPlugins[key]) {
                        everyEventPlugins[key] = new Array();
                    }

                    (everyEventPlugins[key] as Function[]).push(listener);
                }
            }
        }
        
        const isTS = __filename.endsWith(".ts") || typeof (globalThis as any).Bun !== "undefined";
        const extensionPattern = isTS ? "{ts,js}" : "js";

        const coreTasks = [
            // auto registration command procecss
            FileLoader.load(Structures.MESSAGE_COMMAND_METADATA_KEY, `${this.basePath}/commands/**/*.${extensionPattern}`, (Component, meta) => {
                const instance = new Component();
                Container.register(`${Structures.MESSAGE_COMMAND_METADATA_KEY}:${meta.name}`, instance);
                meta.aliases?.forEach((a: string) => Container.register(`${Structures.MESSAGE_COMMAND_METADATA_KEY}:${a}`, instance));
                if (meta?.preconditions) instance.preconditions = meta.preconditions;
            }),
            // auto registration precondition process
            FileLoader.load(Structures.MESSAGE_CREATE_PRECONDITION_METADATA_KEY, `${this.basePath}/preconditions/**/*.${extensionPattern}`, (Component, meta) => {
                Container.register(`${Structures.MESSAGE_CREATE_PRECONDITION_METADATA_KEY}:${meta.name}`, new Component());
            }),
            // auto registration logic component process
            FileLoader.load(Structures.BASE_COMPONENT_META_KEY, `${this.basePath}/components/**/*.${extensionPattern}`, (Component, meta) => {
                const registerName = meta.name || Component.name;
                Container.register(registerName, new Component());
            }),
            // auto registration generic listener process
            FileLoader.load(Structures.BASE_LISTENER_METADATA_KEY, `${this.basePath}/listeners/**/*.${extensionPattern}`, (Component, meta) => {
                const instance = new Component();
                const key = meta.eventName as keyof ClientEvents;

                if (meta.once) {
                    this.once(key, (...args) => instance.run(...args));
                    
                } else {
                    if (!everyEventPlugins[key]) everyEventPlugins[key] = [];
                    (everyEventPlugins[key] as Function[]).push((...args: any[]) => instance.run(...args));
                }

                Logger.system(`[Listener Loaded] ${meta.eventName}`);
            }),
            // import framework modules
            import("./modules/index.js").then((modules) => {
                for (const [name, Component] of Object.entries(modules)) {
                    if (typeof Component === "function" && Component.name) {
                        Logger.system(`[Module Hit] ${name}`);
                        Container.register(name, Component);
                    }
                }
            }).catch((error) => Logger.error(error)),
        ];

        await Promise.all([...coreTasks, ...extraTasks]);

        // set default listeners
        const defaultListeners: {
            [K in keyof ClientEvents]?: (...args: ClientEvents[K]) => void | Promise<void>
        } = {
            [Events.MessageCreate]: (message: Message) => new DefaultMessageCreateListener().run(message),
        };
        
        // if not registration of generic listener then push to array
        for (const [eventName, defaultCallback] of Object.entries(defaultListeners)) {
            const key = eventName as keyof ClientEvents;
            if (!everyEventPlugins[key]) {
                everyEventPlugins[key] = [];
                (everyEventPlugins[key] as Function[]).push(defaultCallback as any);
            }
        }

        // registred event listener push to discordjs callbacks
        for (const [eventName, eventPlugins] of Object.entries(everyEventPlugins)) {
            const key = eventName as keyof ClientEvents;

            this.on(key, async (...args) => {
                for (const eventPlugin of eventPlugins!) {
                    try {
                        await (eventPlugin as any)(...args); 
                        
                    } catch (error) {
                        Logger.error(`[Event Error - ${eventName}]: ${error}`);
                    }
                }
            });
            
            Logger.system(`[Event Bound] ${eventName} (${eventPlugins!.length} functions merged)`);
        }
    }
}

declare module "./types/index.js" {
    interface ContainerEntries {
        Core: Core;
    }
}