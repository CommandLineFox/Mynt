import { existsSync, readdirSync, statSync } from "fs";
import type { BotClient } from "../BotClient";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import type Command from "./Command";

export default class CommandHandler {
    protected client: BotClient;

    public constructor(client: BotClient) {
        this.client = client;
        const commands = getCommands(this.client);
        loadCommands(this.client, commands);
    }
}

function getCommands(client: BotClient): Command[] {
    const commands = [] as Command[];
    if (!existsSync("./dist/commands")) {
        return commands;
    }

    const groups = readdirSync("./dist/commands");
    for (const group of groups) {
        const folder = statSync(`./dist/commands/${group}`);
        if (!folder) {
            continue;
        }

        const files = readdirSync(`./dist/commands/${group}`);
        for (const file of files) {
            if (!file.endsWith(".js")) {
                continue;
            }

            const path = `../commands/${group}/${file.slice(0, -3)}`;
            let command;

            try {
                command = require(path).default;
            } catch (error) {
                console.log(error);
            }

            const cmd = new command;
            commands.push(cmd.data.toJSON());
            client.commands.set(cmd.data.name, cmd);
        }
    }
    return commands;
}

export function loadCommands(client: BotClient, commands: Command[]) {
    const rest = new REST({ version: '9' }).setToken(client.config.token);

    (async () => {
        try {
            console.log('Started refreshing commands.');

            await rest.put(
                Routes.applicationGuildCommands(client.config.id, client.config.guild),
                { body: commands },
            );

            console.log('Successfully reloaded commands.');
        } catch (error) {
            console.error(error);
        }
    })();
}