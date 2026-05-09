export class FormatTemplate {
    public static formatDuration(seconds: number) {
        const [m, s] = [
            Math.floor(seconds / 60),
            Math.floor(seconds % 60),
        ];
        return `${m}:${s.toString().padStart(2, "0")}`;
    }
}

declare module "@core/containersType" {
    interface ContainerEntries {
        FormatTemplate: typeof FormatTemplate;
    }
}