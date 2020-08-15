import Command from "@command/Command";
import { Administration } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { Guild } from "~/models/Guild";

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

        const args = event.argument.split(' ');
        const subcommand = args.shift()?.trim();

        switch (subcommand) {
            case "prefix": {
                const prefix = args.shift()?.trim();
                if (!prefix) {
                    event.send(`The prefix is currently set to \`${guild?.config.prefix || client.config.prefix}\``);
                    return;
                }

                if (prefix.length > 5) {
                    event.send("The prefix can be up to 5 characters.");
                    return;
                }

                if (prefix.toLowerCase() === "reset") {
                    database?.guilds.updateOne({ id: guild?.id }, { "$set": { "config.prefix": client.config.prefix } });
                    event.send(`The prefix has been set to \`${client.config.prefix}\``);
                    return;
                }

                database?.guilds.updateOne({ id: guild?.id }, { "$set": { "config.prefix": prefix } });
                event.send(`The prefix has been set to \`${args[1]}\``);
                break;
            }
        }
    }
}