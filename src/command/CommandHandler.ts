import { existsSync, readdirSync, statSync } from "fs";
import type { BotClient } from "../BotClient";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import type Command from "./Command";
import type Subcommand from "./Subcommand";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

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
        if (!statSync(`./dist/commands/${group}`)) {
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

            let cmd = new command;
            cmd = addSubCommands(cmd, `${group}/${file.slice(0, -3).toLowerCase()}`);
            commands.push(cmd.data.toJSON());
            client.commands.set(cmd.data.name, cmd);
        }
    }
    return commands;
}

export function loadCommands(client: BotClient, commands: Command[]): void {
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

function addSubCommands(command: Command, location: string): Command {
    if (!existsSync(`./dist/commands/${location}`)) {
        return command;
    }

    if (!statSync(`./dist/commands/${location}`)) {
        return command;
    }

    const files = readdirSync(`./dist/commands/${location}`);
    if (!files) {
        return command;
    }

    for (const file of files) {
        if (!file.endsWith(".js")) {
            continue;
        }

        const subcommandpath = `../commands/${location}/${file.slice(0, -3)}`;
        let subcommand;

        try {
            subcommand = require(subcommandpath).default;
        } catch (error) {
            console.log(error);
        }

        const sbc = (new subcommand) as Subcommand;

        command.data.addSubcommand(new SlashCommandSubcommandBuilder().setName(sbc.data.name).setDescription(sbc.data.description));
        command.subcommands.push(sbc);
    }

    return command;
}
