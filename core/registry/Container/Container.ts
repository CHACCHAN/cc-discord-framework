import { Logger } from "@core/utils/index.js";
import type { ContainerEntries } from "@core/containersType";

export class Container {
    private static instance = new Map<string, any>();

    public static readonly proxy = new Proxy(Container, {
        get(target, prop) {
            if (typeof prop === "string" && !(prop in target)) {
                return target.get(prop as any);
            }
            return (target as any)[prop];
        }
    }) as typeof Container & ContainerEntries;

    public static register<K extends keyof ContainerEntries | (string & {})>(
        name: K, 
        instance: K extends keyof ContainerEntries ? ContainerEntries[K] : any
    ) {
        this.instance.set(name as string, instance);
        Logger.system(`[Container Register] ${name}`);
    }

    public static get<K extends keyof ContainerEntries>(name: K): ContainerEntries[K];
    public static get<K extends keyof ContainerEntries>(name: K[]): { [P in K]: ContainerEntries[P] };

    public static get(nameOrNames: any): any {
        if (Array.isArray(nameOrNames)) {
            const result: any = {};
            for (const name of nameOrNames) {
                const instance  = this.instance.get(name as string);
                if (!instance) return;
                result[name as string] = instance;
                Logger.system(`[Container Get] ${result[name]}`);
            }
            return result;

        } else {
            const instance = this.instance.get(nameOrNames as string);
            if (!instance) return;
            Logger.system(`[Container Get] ${nameOrNames}`);
            return instance;
        }
    }
}