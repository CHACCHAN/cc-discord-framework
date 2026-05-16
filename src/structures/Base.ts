import { Cache, Container } from "../registry/index.js";
import "reflect-metadata";

export function BaseApplyDecorator<T>(key: string, options: T): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata(key, options, target);
    }
}

export abstract class Base {
    public get container() {
        return Container.proxy;
    }

    public get cache() {
        return Cache.proxy;
    }
}