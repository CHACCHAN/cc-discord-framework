import { Logger } from "../../../utils/index.js";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, InteractionCollector, Message, type CacheType, type InteractionReplyOptions, type MessageCreateOptions, type MessageEditOptions, type ReadonlyCollection, type RepliableInteraction } from "discord.js";

interface ButtonOption {
    id: string;
    label?: string;
    style?: ButtonStyle;
    emoji?: string;
    disabled?: boolean;
}

interface CollectorOption {
    filter?: (i: ButtonInteraction) => boolean;
    time?: number;
    onCollect: (interaction: ButtonInteraction, action: string) => Promise<void> | void;
    onEnd?: (collect: ReadonlyCollection<string, ButtonInteraction<CacheType>>, reason: string) => void;
}

interface RenderParam {
    target: RepliableInteraction | Message;
    options: string | InteractionReplyOptions | MessageCreateOptions | MessageEditOptions;
}

export class PaginationTemplate extends ActionRowBuilder<ButtonBuilder> {
    public message?: Message;
    public collector?: InteractionCollector<ButtonInteraction>;

    constructor() {
        super();
    }

    // embedにボタンを配置
    public setButtons(options: ButtonOption[]): PaginationTemplate {
        this.setComponents(
            options.map(option => {
                const btn = new ButtonBuilder()
                    .setCustomId(option.id)
                    .setStyle(option.style ?? ButtonStyle.Primary)
                    .setDisabled(option.disabled ?? false);
                if (option.label) btn.setLabel(option.label);
                if (option.emoji) btn.setEmoji(option.emoji);
                return btn;
            })
        );
        return this;
    }

    // 標準ページネーションを付与
    public addPagination(current: number, total: number, idPrefix: string): PaginationTemplate {
        return this.setButtons([
            { id: `${idPrefix}_first`, label: "≪", style: ButtonStyle.Secondary, disabled: current <= 1 },
            { id: `${idPrefix}_prev`,  label: "前へ", style: ButtonStyle.Primary,   disabled: current <= 1 },
            { id: `${idPrefix}_info`,  label: `${current} / ${total}`, style: ButtonStyle.Secondary, disabled: true },
            { id: `${idPrefix}_next`,  label: "次へ", style: ButtonStyle.Primary,   disabled: current >= total },
            { id: `${idPrefix}_last`,  label: "≫", style: ButtonStyle.Secondary, disabled: current >= total },
        ]);
    }

    // 標準確認UIを付与
    public addConfirm(idPrefix: string): PaginationTemplate {
        return this.setButtons([
            { id: `${idPrefix}_yes`, label: "決定", style: ButtonStyle.Success },
            { id: `${idPrefix}_no`,  label: "中止", style: ButtonStyle.Danger }
        ]);
    }

    // コレクターを作る
    public createCollector(options: CollectorOption): PaginationTemplate {
        if (!this.message) {
            Logger.error("[PaginationTemplate] レンダー後に実行してください");
            throw new Error("SET_MESSAGE");
        }

        this.collector = this.message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: options.time ?? 60000,
            filter: options.filter,
        });

        this.collector.on("collect", async (i) => {
            const action = i.customId.split("_").pop() ?? i.customId;
            await options.onCollect(i, action);
        });

        this.collector.on("end", async (collect, reason) => {
            await options.onEnd?.(collect, reason);
        });

        return this;
    }

    // レンダリング
    public async render(param: RenderParam): Promise<Message> {
        const { target, options } = param;
        const payload = typeof options === "string" ? { content: options } : options;
        const finalPayload = { ...payload, components: [this] };

        if (target instanceof Message) {
            // 既に存在してボット(自分)なら編集
            if (target.editable) {
                this.message = await target.edit(finalPayload as MessageEditOptions);

            } else {
                this.message = await target.reply(finalPayload as MessageCreateOptions);
            }

        } else {
            // インタラクションが返信済みか、更新中か
            if (target.replied || target.deferred) {
                this.message = await target.editReply(finalPayload as MessageEditOptions);

            } else if (target.isButton() || target.isAnySelectMenu()) {
                // ボタン等のインタラクションならメッセージ自体を更新
                const response = await target.update({ ...finalPayload, fetchReply: true } as any);
                this.message = response as unknown as Message;

            } else {
                const response = await target.reply({ ...finalPayload, fetchReply: true } as InteractionReplyOptions);
                this.message = response as unknown as Message;
            }
        }
        if (!this.message || !(this.message instanceof Message)) {
            if (!(target instanceof Message)) {
                this.message = await target.fetchReply();
            }
        }
        return this.message;
    }

    public async disable(): Promise<void> {
        if (!this.message) return;

        const disabledRows = this.components.map(c => ButtonBuilder.from(c).setDisabled(true));
        this.setComponents(disabledRows);

        try {
            await this.message.edit({ components: [this] });

        } catch (error) {
            Logger.error(error);
        }
    }
}

declare module "../../../types/index.js" {
    interface ContainerEntries {
        PaginationTemplate: typeof PaginationTemplate;
    }
}