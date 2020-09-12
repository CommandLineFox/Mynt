import Command from "@command/Command";
import { Administration } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { Guild } from "@models/Guild";
import { Database } from "@utils/Database";

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
                prefixsettings(event, args, guild!);
                break;
            }

            case "moderator":
            case "mods":
            case "moderators":
            case "staff": {
                moderatorsettings(event, args, guild!);
                break;
            }
        }
    }
}

async function prefixsettings(event: CommandEvent, args: string[], guild: Guild) {
    const client = event.client;
    const database = client.database;
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
        await database?.guilds.updateOne({ id: guild?.id }, { "$set": { "config.prefix": client.config.prefix } });
        event.send(`The prefix has been set to \`${client.config.prefix}\``);
        return;
    }

    await database?.guilds.updateOne({ id: guild?.id }, { "$set": { "config.prefix": prefix } });
    event.send(`The prefix has been set to \`${prefix}\``);
}

async function moderatorsettings(event: CommandEvent, args: string[], guild: Guild) {
    const database = event.client.database;
    const option = args.shift()?.trim();

    if (!option) {
        const mods = guild?.config.roles?.moderator;
        if (!mods || mods.length === 0) {
            event.send("There is no moderator roles.");
            return;
        }

        let list = `**The following roles are moderator roles:**\n`;
        mods.forEach((mod) => {
            const role = event.guild.roles.cache.get(mod);
            if (!role) {
                database?.guilds.updateOne({ id: event.guild.id }, { "$pull": { "config.roles.moderator": mod } });
            }
            else {
                list += `${role.name}\n`;
            }
        })
        event.send(list);
        return;
    }
    
    databaseCheck(database!, guild, "moderator");
    const staff = args.shift()?.trim();

    if (!staff) {
        event.send("You need to specify a role.");
        return;
    }

    const role = event.guild.roles.cache.find(role => role.id === staff || role.name === staff || `<@&${role.id}>` === staff);

    if (!role) {
        event.send("Couldn't find the role you're looking for.");
        return;
    }

    switch (option) {
        case "add": {
            if (guild.config.roles?.moderator?.includes(role.id)) {
                event.send('The specified role is already a moderator role.');
                break;
            }
            await database?.guilds.updateOne({ id: event.guild.id }, { "$push": { "config.roles.moderator": role.id } });
            event.send(`Added \`${role.name}\` as a moderator role.`);
            break;
        }
        case "remove": {
            if (!guild.config.roles?.moderator?.includes(role.id)) {
                event.send('The specified role is not a moderator role.');
                break;
            }
            await database?.guilds.updateOne({ id: event.guild.id }, { "$pull": { "config.roles.moderator": role.id } });
            event.send(`\`${role.name}\` is no longer a moderator role.`);
            break;
        }
    }
}

async function databaseCheck(database: Database, guild: Guild, option: string) {
    switch (option) {
        case "roles": {
            if (!guild.config.roles) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles": {} } });
            }
            break;
        }
        case "channels": {
            if (!guild.config.channels) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.channels": {} } });
            }
            break;
        }
        case "moderator": {
            if (!guild.config.roles) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles": {"moderator": []} } });
            }
            else if (!guild.config.roles!.moderator) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.moderator": [] } });
            }
            break;
        }
    }
}