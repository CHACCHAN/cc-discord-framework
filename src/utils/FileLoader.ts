import { glob } from "glob";
import path from "node:path";
import "reflect-metadata";
import { Logger } from "./Logger.js";

export class FileLoader {
    /**
     * @param metadataKey 検索するデコレータのキー (DecoratorKeys の値)
     * @param pattern スキャンするファイルの glob パターン
     * @param handler 見つかったクラス（設計図）をどう処理するかの関数
     */
    public static async load(
        metadataKey: string, 
        pattern: string, 
        handler: (Component: any, metadata: any) => void
    ) {
        const rootPath = process.cwd();
        const files = await glob(pattern);

        for (const file of files) {
            const absolutePath = path.resolve(rootPath, file);
            const module = await import(absolutePath);

            Logger.system(`[FileLoader Hit] ${absolutePath}`)
            
            const classes = Object.values(module).filter(
                (val): val is Function => typeof val === 'function' && Reflect.hasMetadata(metadataKey, val)
            );

            for (const Component of classes) {
                const metadata = Reflect.getMetadata(metadataKey, Component);
                handler(Component, metadata);
            }
        }
    }
}