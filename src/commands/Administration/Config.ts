import Command from "@command/Command";
import { Administration } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { Guild } from "@models/Guild";
import { Database } from "@utils/Database";
import { MessageEmbed, Role } from "discord.js";

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

        switch (subcommand.toLowerCase()) {
            case "prefix": {
                prefixSettings(event, option, guild!);
                break;
            }

            case "mod":
            case "mods":
            case "moderator":
            case "moderators":
            case "staff": {
                moderatorSettings(event, option, args, guild!);
                break;
            }

            case "mute":
            case "muted":
            case "muterole": {
                muteSettings(event, option, args, guild!);
                break;
            }

            case "automod": {
                automodSettings(event, option, guild!);
                break;
            }

            case "badwords":
            case "filter": {
                filterSettings(event, option, args, guild!);
                break;
            }

            case "overwrites":
            case "overwrite":
            case "special": {
                overwriteSettings(event, option, args, guild!);
                break;
            }

            case "log":
            case "logs":
            case "logging": {
                loggingSettings(event, option, args, guild!);
                break;
            }

            case "invite":
            case "inviteblock":
            case "adblock":
            case "adblocker":
            case "adsblocker": {
                inviteBlockerSettings(event, option, guild!);
            }
        }
    }
}

async function prefixSettings(event: CommandEvent, option: string, guild: Guild) {
    const client = event.client;
    const database = client.database;

    if (!option) {
        event.send(`The prefix is currently set to \`${guild?.config.prefix || client.config.prefix}\``);
        return;
    }

    switch (option.toLowerCase()) {
        case "reset": {
            await database?.guilds.updateOne({ id: guild?.id }, { "$set": { "config.prefix": client.config.prefix } });
            event.send(`The prefix has been set to \`${client.config.prefix}\``);
            break;
        }

        default: {
            if (option.length > 5) {
                event.send("The prefix can be up to 5 characters.");
                break;
            }

            await database?.guilds.updateOne({ id: guild?.id }, { "$set": { "config.prefix": option } });
            event.send(`The prefix has been set to \`${option}\``);
            break;
        }
    }
}

async function moderatorSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;
    databaseCheck(database!, guild, "moderator");

    if (!option) {
        const mods = guild?.config.roles?.moderator;
        if (!mods || mods.length === 0) {
            event.send("There is no moderator roles.");
            return;
        }

        const embed = new MessageEmbed()
            .setTitle("The following roles are moderator roles:");

        let list = "";
        mods.forEach((mod) => {
            const role = event.guild.roles.cache.get(mod);
            if (!role) {
                database?.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } });
            }
            else {
                list += `${role.name}\n`;
            }
        })

        embed.setDescription(list);
        event.send({ embed: embed });
        return;
    }

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

    switch (option.toLowerCase()) {
        case "add": {
            if (guild.config.roles?.moderator?.includes(role.id)) {
                event.send("The specified role is already a moderator role.");
                break;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$push": { "config.roles.moderator": role.id } });
            event.send(`Added \`${role.name}\` as a moderator role.`);
            break;
        }
        case "remove": {
            if (!guild.config.roles?.moderator?.includes(role.id)) {
                event.send("The specified role isn't a moderator role.");
                break;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": role.id } });
            event.send(`\`${role.name}\` is no longer a moderator role.`);
            break;
        }
    }
}

async function muteSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;
    databaseCheck(database!, guild, "roles");

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
        return;
    }

    switch (option.toLowerCase()) {
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
                event.send("The specified role is already set as the mute role.");
                return;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.muted": role.id } });
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
                event.send("No role is specified as the mute role.");
                return;
            }

            const role = event.guild.roles.cache.get(guild.config.roles.muted);
            if (!role) {
                event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.muted": null } });
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
                event.send("There is no muted role set.");
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

async function automodSettings(event: CommandEvent, option: string, guild: Guild) {
    const database = event.client.database;
    databaseCheck(database!, guild, "automod");

    if (!option) {
        const automod = guild?.config.automod;
        if (automod === false) {
            event.send("Automod is disabled.");
            return;
        }

        const filter = guild.config.filter;
        const adblocker = guild.config.adblocker;
        const embed = new MessageEmbed()
            .setTitle("Here's a list of automod features:")
            .addField("Word filter", `\`${(filter && filter.enabled) ? "Enabled" : "Disabled"}\``, true)
            .addField("Ad blocker", `\`${(adblocker === true) ? "Enabled" : "Disabled"}\``, true);

        event.send({ embed: embed });
        return;
    }

    switch (option.toLowerCase()) {
        case "enable": {
            if (guild.config.automod === true) {
                event.send("Automod is already enabled.");
                return;
            }

            database?.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod.enabled": true } });
            event.send("Succefully enabled automod features.");
            break;
        }

        case "disable": {
            if (!guild.config.automod === false) {
                event.send("Automod is already disabled.");
                return;
            }

            database?.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod.enabled": false } });
            event.send("Succefully disabled automod features.");
            break;
        }
    }
}

async function filterSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;
    databaseCheck(database!, guild, "filter");

    if (!option) {
        const filter = guild?.config.filter?.list;
        if (!filter || filter.length === 0) {
            event.send("There is no filtered words.");
            return;
        }

        const embed = new MessageEmbed()
            .setTitle("The following words are filtered:")

        let list = "";
        filter.forEach((word) => {
            list += `\`${word}\` `;
        })

        embed.setDescription(list);
        event.send({ embed: embed });
        return;
    }

    switch (option.toLowerCase()) {
        case "add": {
            const word = args;

            if (!word) {
                event.send("You need to specify a word.");
                return;
            }

            if (guild.config.filter?.list?.includes(word)) {
                event.send("The specified word is already filtered.");
                return;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$push": { "config.automod.filter.list": word } });
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
                return;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$pull": { "config.automod.filter.list": word } });
            event.send(`Removed \`${word}\` from the filter.`);
            break;
        }

        case "enable": {
            if (guild.config.filter?.enabled) {
                event.send("The word filter is already enabled.");
                return;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod.filter.enabled": true } });
            event.send("Enabled the word filter.");
            break;
        }

        case "disable": {
            if (!guild.config.filter?.enabled) {
                event.send("The word filter is already disabled.");
                return;
            }

            await database?.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod.filter.enabled": false } });
            event.send("Disabled the word filter.");
            break;
        }
    }
}

async function inviteBlockerSettings(event: CommandEvent, option: string, guild: Guild) {
    const database = event.client.database;
    databaseCheck(database!, guild, "inviteblocker");

    if (!option) {
        const adblocker = guild.config.adblocker;

        if (adblocker === false) {
            event.send("The invite blocker is disabled.");
            return;
        }
        else if (adblocker === true) {
            event.send("The invite blocker is enabled");
            return;
        }
    }

    switch (option) {
        case "enable": {
            if (guild.config.adblocker === true) {
                event.send("The invite blocker is already enabled");
                return;
            }

            database?.guilds.updateOne({ id: guild.id }, { "$set": { "config.adblocker": true } });
            event.send("The invite blocker has been enabled.");
            break;
        }

        case "disable": {
            if (guild.config.adblocker === false) {
                event.send("The invite blocker is already disabled");
                return;
            }

            database?.guilds.updateOne({ id: guild.id }, { "$set": { "config.adblocker": false } });
            event.send("The invite blocker has been disabled.");
            break;
        }
    }
}

async function overwriteSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;
    databaseCheck(database!, guild, "overwrite");

    if (!option) {
        let staffbypass = guild.config.staffbypass === true ? "Enabled" : "Disabled";

        const embed = new MessageEmbed()
            .setTitle("These are the overwrites for this server:")
            .addField("Staff bypass", `${staffbypass}`, true);

        event.send({ embed: embed });
        return;
    }

    switch (option.toLowerCase()) {
        case "staffbypass": {
            const value = args;
            switch (value) {
                case "enable": {
                    if (guild.config.staffbypass === true) {
                        event.send("Staff's ability to bypass automod is already enabled.");
                        return;
                    }

                    database?.guilds.updateOne({ id: guild.id }, { "$set": { "config.staffbypass": true } });
                    event.send("Enabled staff's ability to bypass automod.");
                    break
                }

                case "disable": {
                    if (!guild.config.staffbypass) {
                        event.send("Staff's ability to bypass automod is already disabled.");
                        return;
                    }

                    database?.guilds.updateOne({ id: guild.id }, { "$set": { "config.staffbypass": false } });
                    event.send("Disabled staff's ability to bypass automod.");
                    break;
                }
            }
        }
    }
}

async function loggingSettings(event: CommandEvent, option: string, _args: string, guild: Guild) {
    const database = event.client.database;
    databaseCheck(database!, guild, "channels");

    if (!option) {

        const embed = new MessageEmbed()
            .setTitle("These are the logging shit for this server:")

        event.send({ embed: embed });
        return;
    }
}

async function databaseCheck(database: Database, guild: Guild, option: string) {
    switch (option.toLowerCase()) {
        case "roles": {
            if (!guild.config.roles) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles": {} } });
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

        case "channels": {
            if (!guild.config.channels) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.channels": {} } });
            }
            break;
        }

        case "automod": {
            if (!guild.config.automod) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod": { "enabled": false } } });
            }
            break;
        }

        case "filter": {
            if (!guild.config.filter) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod": { "filter": { "enabled": false, "list": [] } } } });
            }
            break;
        }

        case "inviteblocker": {
            if (!guild.config.adblocker) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.inviteblocker": false } });
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