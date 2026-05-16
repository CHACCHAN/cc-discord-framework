import { EmbedBuilder, Emoji, Message, User, type ColorResolvable, type EmojiIdentifierResolvable } from "discord.js";

const COLORS = {
    SUCCESS: "#00FFAA" as ColorResolvable,
    ERROR: "#FF4444" as ColorResolvable,
    INFO: "#44AAFF" as ColorResolvable,
};

export class EmbedTemplate extends EmbedBuilder {
    constructor(type: keyof typeof COLORS) {
        super();
        this.setColor(COLORS[type] || COLORS.INFO);
        this.setTimestamp();
    }

    public setEmojiDescription(emoji: EmojiIdentifierResolvable | Emoji, content: string): EmbedTemplate {
        this.setDescription(`${emoji} **${content}**`);
        return this;
    }

    public setMenu(...args: string[]): EmbedTemplate {
        this.setTitle(`${args.join(" ")}`);
        return this;
    }

    public setMenuAuthor(names: string[], avatarUrl: string | undefined): EmbedTemplate {
        this.setAuthor({ name: names.join(" "), iconURL: avatarUrl });
        return this;
    }

    public static success() {
        return new EmbedTemplate("SUCCESS");
    }

    public static error() {
        return new EmbedTemplate("ERROR");
    }

    public static info() {
        return new EmbedTemplate("INFO");
    }
}

declare module "@core/containersType" {
    interface ContainerEntries {
        EmbedTemplate: typeof EmbedTemplate;
    }
}