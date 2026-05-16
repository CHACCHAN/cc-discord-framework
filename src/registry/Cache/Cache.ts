import { Logger } from "@core/utils/index.js";
import type { CacheEntries } from "@core/cacheType";

interface CacheItem<T> {
    value: T;
    timeoutId: NodeJS.Timeout;
}

export class Cache {
    private static cache = new Map<string, CacheItem<any>>();
    private static readonly DEFAULT_TTL = 10 * 60 * 1000;

    public static readonly proxy = new Proxy(Cache, {
        get(target, prop) {
            if (typeof prop === "string" && !(prop in target)) {
                return target.get(prop);
            }
            return (target as any)[prop];
        }
    }) as typeof Cache & CacheEntries;

    public static key(...keys: string[]): string {
        return keys.join(":");
    }

    public static set<T>(key: string, value: T, ttl: number = this.DEFAULT_TTL): void {
        this.clearTimer(key);

        const timeoutId = setTimeout(() => {
            this.cache.delete(key);
            Logger.system(`[Cache Expired] ${key}`);
        }, ttl);

        this.cache.set(key, { value, timeoutId });
        Logger.system(`[Cache Set] ${key} (TTL: ${ttl}ms)`);
    }

    public static get<T>(key: string, ttl: number = this.DEFAULT_TTL): T | undefined {
        const item = this.cache.get(key);
        if (!item) return undefined;

        // 一度使われたから、古い消去タイマーを壊して新しいタイマーをセット（延命）
        this.clearTimer(key);
        item.timeoutId = setTimeout(() => {
            this.cache.delete(key);
            Logger.system(`[Cache Expired] ${key}`);
        }, ttl);

        Logger.system(`[Cache Get] ${key} (TTL Extended)`);
        return item.value as T;
    }

    public static delete(key: string): void {
        this.clearTimer(key);
        this.cache.delete(key);
        Logger.system(`[Cache Deleted] ${key}`);
    }


    public static clear(): void {
        for (const key of this.cache.keys()) {
            this.clearTimer(key);
        }
        this.cache.clear();
        Logger.system(`[Cache Cleared All]`);
    }

    private static clearTimer(key: string): void {
        const item = this.cache.get(key);
        if (item?.timeoutId) {
            clearTimeout(item.timeoutId);
        }
    }
}