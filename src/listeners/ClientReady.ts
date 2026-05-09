import { ApplyListener, Events, Logger, BaseListener, Client } from "@core";

@ApplyListener({ eventName: Events.ClientReady, once: true })

export class ClientReady extends BaseListener<Events.ClientReady> {
    public override async run(client: Client<true>) {
        Logger.info(`${client.user.tag} is Ready!`);
    }
}