import { ApplyComponent } from "@core";
import { hc } from "hono/client";
import type { AppType } from "@api";

@ApplyComponent()

export class HonoComponent {
    public readonly client = hc<AppType>("http://cc-api:3000");
}

declare module "@core/containersType" {
    interface ContainerEntries {
        HonoComponent: HonoComponent
    }
}