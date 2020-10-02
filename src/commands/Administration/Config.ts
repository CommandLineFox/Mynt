import Command from "@command/Command";
import { Administration } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { Guild } from "@models/Guild";
import { Database } from "@utils/Database";
import { Role } from "discord.js";

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

        const [subcommand, option, args] = event.argument.split(/\s+/, 3);

        switch (subcommand) {
            case "prefix": {
                prefixSettings(event, args, guild!);
                break;
            }

            case "moderator":
            case "mods":
            case "moderators":
            case "staff": {
                moderatorSettings(event, option, args, guild!);
                break;
            }

            case "mute":
            case "muted": {
                muteSettings(event, option, args, guild!);
                break;
            }

            case "holyshitwhatthefuckdidyoujustsaytome":
            case "badwords":
            case "filter": {
                filterSettings(event, option, args, guild!);
                break;
            }
        }
    }
}

async function prefixSettings(event: CommandEvent, args: string, guild: Guild) {
    const client = event.client;
    const database = client.database;
    const prefix = args;

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

async function moderatorSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;

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
    const staff = args;

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

async function muteSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        const id = guild?.config.roles?.muted;
        if (!id) {
            event.send("There is no role set as the mute role.");
            return;
        }

        const role = event.guild.roles.cache.get(id);
        if (!role) {
            event.send("The role that used to be the mute role was deleted or can't be found.");
            return;
        }

        event.send(`\`${role.name}\` is set as the mute role.`);
    }

    databaseCheck(database!, guild, "moderator");

    switch (option) {
        case "setauto":
        case "set": {
            const muted = args;

            if (!muted) {
                event.send("You need to specify a role.");
                return;
            }

            const role = event.guild.roles.cache.find(role => role.id === muted || role.name === muted || `<@&${role.id}>` === muted);

            if (!role) {
                event.send("Couldn't find the role you're looking for.");
                return;
            }

            if (guild.config.roles?.muted === role.id) {
                event.send('The specified role is already set as the mute role.');
                return;
            }

            await database?.guilds.updateOne({ id: event.guild.id }, { "$set": { "config.roles.muted": role.id } });
            event.send(`Set \`${role.name}\` as the mute role.`);

            if (option === "setauto") {
                setMutePermissions(event, role);
                event.send(`Automatically set permission overwrites for \`${role.name}\`.`);
            }
            break;
        }
        case "autoremove":
        case "remove": {
            if (!guild.config.roles?.muted) {
                event.send('No role is specified as the mute role.');
                return;
            }

            const role = event.guild.roles.cache.get(guild.config.roles.muted);
            if (!role) {
                event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }

            await database?.guilds.updateOne({ id: event.guild.id }, { "$set": { "config.roles.muted": null } });
            event.send(`\`${role.name}\` is no longer the mute role.`);

            if (option === "autoremove") {
                removeMutePermissions(event, role);
                event.send(`Automatically removed permission overwrites for \`${role.name}\`.`);
            }
            break;
        }

        case "perm":
        case "permissions":
        case "setperm":
        case "setpermissions": {
            if (!guild.config.roles?.muted) {
                event.send(`There is no muted role set.`);
                return;
            }

            const role = event.guild.roles.cache.get(guild.config.roles.muted);
            if (!role) {
                event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }

            setMutePermissions(event, role);
            event.send(`Set permission overwrites for \`${role.name}\`.`);
            break;
        }

        case "removeperm":
        case "removepermissions": {
            if (!guild.config.roles?.muted) {
                event.send(`There is no muted role set.`);
                return;
            }

            const role = event.guild.roles.cache.get(guild.config.roles.muted);
            if (!role) {
                event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }

            removeMutePermissions(event, role);
            event.send(`Removed permission overwrites for \`${role.name}\`.`);
            break;
        }
    }
}

async function filterSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        const filter = guild?.config.filter?.list;
        if (!filter || filter.length === 0) {
            event.send("There is no filtered words.");
            return;
        }

        let list = `**The following words are filtered: **\n`;
        filter.forEach((word) => {
            list += `\`${word}\` `;
        })

        event.send(list);
        return;
    }

    databaseCheck(database!, guild, "filter");

    switch (option) {
        case "add": {
            const word = args;

            if (!word) {
                event.send("You need to specify a word.");
                return;
            }

            if (guild.config.filter?.list?.includes(word)) {
                event.send("'The specified word is already filtered.");
                break;
            }

            await database?.guilds.updateOne({ id: event.guild.id }, { "$push": { "config.filter.list": word } });
            event.send(`Added \`${word}\` to the filter.`);
            break;
        }
        case "remove": {
            const word = args;

            if (!word) {
                event.send("You need to specify a word.");
                return;
            }

            if (!guild.config.filter?.list?.includes(word)) {
                event.send("The specified word isn't filtered.");
                break;
            }

            await database?.guilds.updateOne({ id: event.guild.id }, { "$pull": { "config.filter.list": word } });
            event.send(`Removed \`${word}\` from the filter.`);
            break;
        }
        case "enable": {
            if (guild.config.filter?.enabled) {
                event.send("The word filter is already enabled.");
                return;
            }

            await database?.guilds.updateOne({ id: event.guild.id }, { "$set": { "config.filter.enabled": true } });
            event.send("Enabled the word filter.");
        }
        case "disable": {
            if (!guild.config.filter?.enabled) {
                event.send("The word filter is already disabled.");
                return;
            }

            await database?.guilds.updateOne({ id: event.guild.id }, { "$set": { "config.filter.enabled": false } });
            event.send("Disabled the word filter.");
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
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles": { "moderator": [] } } });
            }

            else if (!guild.config.roles!.moderator) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.moderator": [] } });
            }
            break;
        }
        case "filter": {
            if (!guild.config.filter) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.filter": { "enabled": false, "list": [] } } });
            }
            break;
        }
    }
}

function setMutePermissions(event: CommandEvent, role: Role) {
    const guild = event.guild;
    guild.roles.cache.get(role.id)?.setPermissions(0);

    guild.channels.cache.forEach((channel) => {
        if (channel.type === "category") {
            channel.updateOverwrite(role, { "SEND_MESSAGES": false, "ADD_REACTIONS": false, "SPEAK": false }, "Mute role setup");
        }
        if (channel.type === "text" && !channel.permissionsLocked) {
            channel.updateOverwrite(role, { "SEND_MESSAGES": false, "ADD_REACTIONS": false }, "Mute role setup");
        }
        if (channel.type === "voice" && !channel.permissionsLocked) {
            channel.updateOverwrite(role, { "SPEAK": false }, "Mute role setup");
        }
    })
}

function removeMutePermissions(event: CommandEvent, role: Role) {
    const guild = event.guild;

    guild.channels.cache.forEach((channel) => {
        if (channel.type === "category") {
            channel.permissionOverwrites.delete(role.id);
        }
        if (channel.type === "text" && !channel.permissionsLocked) {
            channel.permissionOverwrites.delete(role.id);
        }
        if (channel.type === "voice" && !channel.permissionsLocked) {
            channel.permissionOverwrites.delete(role.id);
        }
    })
}