import Command from "@command/Command";
import { Administration } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { Guild } from "~/models/Guild";
import ArgumentHandler from "@command/ArgumentHandler";

export default class Config extends Command {
    constructor() {
        super({ name: "Config", triggers: ["config", "cfg", "setup"], description: "Configures various settings for the guild", group: Administration });
    }

    async run(event: CommandEvent) {
        const client = event.client;
        const database = client.database;

        let guild = await database!.guilds.findOne({ id: event.guild.id });
        if (!guild) {
            const newguild = new Guild({ id: event.guild.id });
            await database!.guilds.insertOne(newguild);
            guild = await database!.guilds.findOne({ id: event.guild.id });
        }

        const args = await ArgumentHandler.getArguments(event, event.argument, "string");
        if (!args) {
            return;
        }

        const [subcommand, argument] = args;

        switch (subcommand) {
            case "prefix": {
                if (argument.length === 0) {
                    event.send(`The prefix is currently set to ${guild?.config.prefix || client.config.prefix}`);
                    return;
                }

                if (argument.length > 5) {
                    event.send("The prefix can be up to 5 characters.");
                    return;
                }

                if (argument.toLowerCase() === "reset") {
                    database?.guilds.updateOne({ id: guild?.id }, { "$set": { "config.prefix": client.config.prefix } });
                    event.send(`The prefix has been set to \`${client.config.prefix}\``);
                    return;
                }

                database?.guilds.updateOne({ id: guild?.id }, { "$set": { "config.prefix": argument } });
                event.send(`The prefix has been set to \`${argument}\``);
                break;
            }
        }
    }
}