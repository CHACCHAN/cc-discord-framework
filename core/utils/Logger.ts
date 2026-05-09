export class Logger {
    public static system(content: any) {
        console.log(`[Core] ${content}`);
    }

    public static info(content: any) {
        console.log(`[Info] ${content}`);
    }

    public static warn(content: any) {
        console.warn(`[Warn] ${content}`);
    }

    public static error(content: any) {
        console.error(`[Error] ${content}`);
    }
}