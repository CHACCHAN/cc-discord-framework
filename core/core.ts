import { Client, Events, type ClientOptions } from "discord.js";
import { Container } from "@core/registry/index.js";
import { FileLoader, Logger } from "@core/utils/index.js";
import * as Structures from "@core/structures/index.js";
import { DefaultMessageCreateListener } from "@core/listeners/index.js";

interface CoreOptions extends ClientOptions {
    defaultPrefix: string;
    basePath: string;
}

interface InitOptions {
    awake?: () => Promise<void> | void;
    start?: (bootstrap: (extraTasks?: Promise<void>[]) => Promise<void>) => Promise<void> | void;
    end?: (login: (token: string) => Promise<void>) => Promise<void> | void;
}

export class Core extends Client {
    public readonly prefix: string;
    public readonly basePath: string;

    constructor(options: CoreOptions) {
        super(options);
        this.prefix = options.defaultPrefix;
        this.basePath = options.basePath;

        Container.register("Core", this);
    }

    // クライアント初期化
    public async init(options: InitOptions): Promise<Core> {
        try {
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

    private async bootstrap(extraTasks: Promise<void>[] = []) {
        const listenerMap = new Map<string, any>();
        const extensionPattern = typeof (globalThis as any).Bun !== "undefined" ? "{ts,js}" : "js";
        const coreTasks = [
            // コマンド自動登録 KEY:NAME:(ALIASES)
            FileLoader.load(Structures.MESSAGE_COMMAND_METADATA_KEY, `${this.basePath}/commands/**/*.${extensionPattern}`, (Component, meta) => {
                const instance = new Component();
                Container.register(`${Structures.MESSAGE_COMMAND_METADATA_KEY}:${meta.name}`, instance);
                meta.aliases?.forEach((a: string) => Container.register(`${Structures.MESSAGE_COMMAND_METADATA_KEY}:${a}`, instance));
                if (meta?.preconditions) instance.preconditions = meta.preconditions;
            }),
            // 前提条件自動登録
            FileLoader.load(Structures.MESSAGE_CREATE_PRECONDITION_METADATA_KEY, `${this.basePath}/preconditions/**/*.${extensionPattern}`, (Component, meta) => {
                Container.register(`${Structures.MESSAGE_CREATE_PRECONDITION_METADATA_KEY}:${meta.name}`, new Component());
            }),
            // コンポーネント
            FileLoader.load(Structures.BASE_COMPONENT_META_KEY, `${this.basePath}/components/**/*.${extensionPattern}`, (Component, meta) => {
                const registerName = meta.name || Component.name;
                Container.register(registerName, new Component());
            }),
            // 汎用リスナー自動登録
            FileLoader.load(Structures.BASE_LISTENER_METADATA_KEY, `${this.basePath}/listeners/**/*.${extensionPattern}`, (Component, meta) => {
                listenerMap.set(meta.eventName, { Component, meta });
            }),
            // モジュール読み込み
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

        // 標準リスナーの登録
        if (!listenerMap.has(Events.MessageCreate)) {
            listenerMap.set(Events.MessageCreate, { 
                Component: DefaultMessageCreateListener, 
                meta: { eventName: Events.MessageCreate, once: false } 
            });
        }

        // 汎用リスナーの登録
        listenerMap.forEach(({ Component, meta }, eventName) => {
            const instance = new Component();
            
            if (meta.once) {
                this.once(eventName, (...args) => instance.run(...args));
            } else {
                this.on(eventName, (...args) => instance.run(...args));
            }
            Logger.system(`[Listener Loaded] ${eventName}`);
        });
    }
}

declare module "@core/containersType" {
    interface ContainerEntries {
        Core: Core;
    }
}