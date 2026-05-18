import type { AudioResource } from "@discordjs/voice";

export interface AudioManagerPluginCallbacks {
    emptyQueue?: () => void;
    trackStart?: () => void;
}

export interface AudioManagerPlugin {
    createResource(): Promise<AudioResource>;
    destroy?(): Promise<void>;
    callbacks?: AudioManagerPluginCallbacks;
}