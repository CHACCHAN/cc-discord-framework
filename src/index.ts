import { Core, GatewayIntentBits, Partials } from "@core";
import "dotenv/config";

const core = new Core({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [
        Partials.Message,
        Partials.Channel, 
        Partials.User, 
        Partials.Reaction, 
        Partials.GuildMember
    ],
    defaultPrefix: "??",
    basePath: __dirname,
});

await core.init({
    awake: () => {},
    start: async (bootstrap) => {
        await bootstrap();
    },
    end: async (login) => {
        await login(process.env.DISCORD_TOKEN!);
    }
});