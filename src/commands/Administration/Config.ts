import Command from "@command/Command";
import { Administration } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { Guild } from "@models/Guild";
import { MessageEmbed, Role } from "discord.js";
import { splitArguments } from "@utils/Argument";
import { Database } from "~/database/Database";
import { DisplayData, LoggingType } from "~/utils/Types";
import { formatLogging } from "@utils/Format";

export default class Config extends Command {
    public constructor() {
        super({
            name: "Config",
            triggers: ["config", "cfg", "setup"],
            description: "Configures various settings for the guild",
            group: Administration,
            botPermissions: ["EMBED_LINKS", "MANAGE_ROLES"]
        });
    }

    protected async run(event: CommandEvent): Promise<void> {
        const client = event.client;
        try {
            const database = client.database;
            const guild = await database.getGuild(event.guild.id);
            if (!guild) {
                return;
            }

            const [subcommand, option, args] = splitArguments(event.argument, 3);
            if (!subcommand) {
                await displayAllSettings(event, guild);
                return;
            }

            switch (subcommand.toLowerCase()) {
                case "prefix": {
                    await prefixSettings(event, option, args, guild);
                    break;
                }

                case "mod":
                case "mods":
                case "moderator":
                case "moderators":
                case "staff": {
                    await moderatorSettings(event, option, args, guild);
                    break;
                }

                case "mute":
                case "muted":
                case "muterole": {
                    await muteSettings(event, option, args, guild);
                    break;
                }

                case "automod": {
                    await autoModSettings(event, option, guild);
                    break;
                }

                case "badwords":
                case "filter": {
                    await filterSettings(event, option, args, guild);
                    break;
                }

                case "overwrites":
                case "overwrite":
                case "special": {
                    await overwriteSettings(event, option, args, guild);
                    break;
                }

                case "log":
                case "logs":
                case "logging": {
                    await loggingSettings(event, option, args, guild);
                    break;
                }

                case "invite":
                case "inviteblock":
                case "ads":
                case "antiadvert":
                case "inviteblocker": {
                    await antiAdvertSettings(event, option, guild);
                    break;
                }
            }
        } catch (error) {
            client.emit("error", (error as Error));
        }
    }
}

async function prefixSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const client = event.client;
    const database = client.database;

    if (!option) {
        await displayData(event, guild, "prefix", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            if (args.length > 5) {
                event.send("The prefix can be up to 5 characters.");
                break;
            }

            await database.guilds.updateOne({ id: guild?.id }, { "$set": { "config.prefix": args } });
            await event.send(`The prefix has been set to \`${args}\``);
            break;
        }

        case "reset": {
            await database.guilds.updateOne({ id: guild?.id }, { "$unset": { "config.prefix": "" } });
            await event.send(`The prefix has been set to \`${client.config.prefix}\``);
            break;
        }
    }
}

async function moderatorSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        await displayData(event, guild, "moderators", true);
        return;
    }

    if (!args) {
        event.send("You need to specify a role.");
        return;
    }

    const role = event.guild.roles.cache.find(role => role.id === args || role.name === args || `<@&${role.id}>` === args);
    if (!role) {
        await event.send("Couldn't find the role you're looking for.");
        return;
    }

    switch (option.toLowerCase()) {
        case "add": {
            if (guild.config.roles?.moderator?.includes(role.id)) {
                await event.send("The specified role is already a moderator role.");
                break;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$push": { "config.roles.moderator": role.id } });
            await event.send(`Added \`${role.name}\` as a moderator role.`);
            break;
        }
        case "remove": {
            if (!guild.config.roles?.moderator?.includes(role.id)) {
                event.send("The specified role isn't a moderator role.");
                break;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": role.id } });
            await event.send(`\`${role.name}\` is no longer a moderator role.`);
            break;
        }
    }
}

async function muteSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        await displayData(event, guild, "muterole", true);
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

            await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.muted": role.id } });
            await event.send(`Set \`${role.name}\` as the mute role.`);

            if (option === "setauto") {
                mutePermissions(event, role, "set");
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
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } });
                await event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } });
            await event.send(`\`${role.name}\` is no longer the mute role.`);

            if (option === "autoremove") {
                mutePermissions(event, role, "remove");
                event.send(`Automatically removed permission overwrites for \`${role.name}\`.`);
            }
            break;
        }

        case "perm":
        case "permissions":
        case "setperm":
        case "setpermissions": {
            if (!guild.config.roles?.muted) {
                event.send("There is no muted role set.");
                return;
            }

            const role = event.guild.roles.cache.get(guild.config.roles.muted);
            if (!role) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } });
                await event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }

            mutePermissions(event, role, "set");
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
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } });
                await event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }

            mutePermissions(event, role, "remove");
            event.send(`Removed permission overwrites for \`${role.name}\`.`);
            break;
        }
    }
}

async function autoModSettings(event: CommandEvent, option: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        await displayData(event, guild, "automod", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "enable": {
            if (guild.config.automod?.enabled === true) {
                event.send("Automod is already enabled.");
                return;
            }

            database.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod.enabled": true } });
            await event.send("Successfully enabled automod features.");
            break;
        }

        case "disable": {
            if (guild.config.automod?.enabled !== true) {
                event.send("Automod is already disabled.");
                return;
            }

            database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.automod": "" } });
            await event.send("Successfully disabled automod features.");
            break;
        }
    }
}

async function filterSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        await displayData(event, guild, "filter", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "add": {
            const word = args;

            if (!word) {
                event.send("You need to specify a word.");
                return;
            }

            if (guild.config.automod?.filter?.list?.includes(word)) {
                event.send("The specified word is already filtered.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$push": { "config.automod.filter.list": word } });
            await event.send(`Added \`${word}\` to the filter.`);
            break;
        }

        case "remove": {
            const word = args;
            if (!word) {
                event.send("You need to specify a word.");
                return;
            }

            if (!guild.config.automod?.filter?.list?.includes(word)) {
                event.send("The specified word isn't filtered.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.automod.filter.list": word } });
            await event.send(`Removed \`${word}\` from the filter.`);
            break;
        }

        case "enable": {
            if (guild.config.automod?.filter?.enabled) {
                event.send("The word filter is already enabled.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod.filter.enabled": true } });
            await event.send("Enabled the word filter.");
            break;
        }

        case "disable": {
            if (!guild.config.automod?.filter?.enabled) {
                event.send("The word filter is already disabled.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod.filter.enabled": false } });
            await event.send("Disabled the word filter.");
            break;
        }
    }
}

async function antiAdvertSettings(event: CommandEvent, option: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        await displayData(event, guild, "antiadvert", true);
    }

    switch (option) {
        case "enable": {
            if (guild.config.automod?.antiAdvert === true) {
                event.send("The anti-advert is already enabled");
                return;
            }

            database.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod.antiadvert": true } });
            await event.send("The anti-advert has been enabled.");
            break;
        }

        case "disable": {
            if (guild.config.automod?.antiAdvert !== true) {
                event.send("The anti-advert is already disabled");
                return;
            }

            database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.automod.antiadvert": "" } });
            await event.send("The anti-advert has been disabled.");
            break;
        }
    }
}

async function overwriteSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        await displayData(event, guild, "overwrites", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "staffbypass": {
            switch (args) {
                case "enable": {
                    if (guild.config.options?.staffBypass === true) {
                        event.send("Staff's ability to bypass automod is already enabled.");
                        return;
                    }

                    database.guilds.updateOne({ id: guild.id }, { "$set": { "config.options.staffBypass": true } });
                    await event.send("Enabled staff's ability to bypass automod.");
                    break;
                }

                case "disable": {
                    if (!guild.config.options?.staffBypass) {
                        event.send("Staff's ability to bypass automod is already disabled.");
                        return;
                    }

                    database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.options.staffBypass": "" } });
                    await event.send("Disabled staff's ability to bypass automod.");
                    break;
                }
            }
        }
    }
}

async function loggingSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        await displayData(event, guild, "logging", true);
        return;
    }

    if (!args) {
        switch (option.toLowerCase()) {
            case "enable": {
                if (guild.config.logging?.enabled === true) {
                    event.send("Logging is already enabled.");
                    return;
                }

                database.guilds.updateOne({ id: guild.id }, { "$set": { "config.logging.enabled": true } });
                await event.send("Enabled logging.");
                break;
            }

            case "disable": {
                if (!guild.config.logging?.enabled) {
                    event.send("Logging is already disabled.");
                    return;
                }

                database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.logging.enabled": "" } });
                await event.send("Disabled logging.");
                break;
            }
        }

        return;
    }

    const [type, id] = args.split(/\s+/, 2);
    const log = formatLogging(type);

    if (log === "None") {
        await event.send("You need to specify a valid logging type.");
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            if (!id) {
                event.send("You need to specify the channel that this type will be logged in.");
                return;
            }

            const channel = event.guild.channels.cache.find(channel => channel.name === id || `<#${channel.id}>` === id);
            if (!channel) {
                event.send("Couldn't find the channel you're looking for.");
                return;
            }

            if (log.length === 1 && guild.config.logging![log[0]] === channel.id) {
                event.send("This logging type is already enabled in this channel.");
                return;
            }

            const successful = [], failed = [];
            for (const logType of log) {
                if (guild.config.logging && guild.config.logging[logType] === channel.id) {
                    failed.push(logType);
                    continue;
                }

                await database.guilds.updateOne({ id: guild.id }, { "$set": { [`config.logging.${logType}`]: channel.id } });
                successful.push(logType);
            }

            let message = "";
            if (successful.length > 0) {
                message += `Successfully enabled \`${successful.join("`, `")}\` in <#${channel.id}>. `;
            }

            if (failed.length > 0) {
                message += ` \`${failed.join("`, `")}\` ${failed.length === 1 ? "was" : "were"} already enabled in <#${channel.id}>.`;
            }

            await event.send(message);
            break;
        }

        case "remove": {
            const successful = [], failed = [];
            if (log.length === 1 && guild.config.logging![log[0]] === undefined) {
                event.send("This logging type is already disabled.");
                return;
            }

            for (const logType of log) {
                if (guild.config.logging![logType] === undefined) {
                    failed.push(logType);
                    continue;
                }

                await database.guilds.updateOne({ id: guild.id }, { "$unset": { [`config.logging.${logType}`]: "" } });
                successful.push(logType);
            }

            let message = "";
            if (successful.length > 0) {
                message += `Successfully disabled \`${successful.join("`, `")}\`. `;
            }

            if (failed.length > 0) {
                message += `\`${failed.join("`, `")}\` ${failed.length === 1 ? "was" : "were"} already disabled.`;
            }

            event.send(message);
            break;
        }
    }
}

async function displayAllSettings(event: CommandEvent, guild: Guild) {
    const embed = new MessageEmbed()
        .setTitle("The current settings for this server:")
        .addField("Prefix", await displayData(event, guild, "prefix"), true)
        .addField("Moderators", await displayData(event, guild, "moderators"), true)
        .addField("Mute role", await displayData(event, guild, "muterole"), true)
        .addField("Automod", await displayData(event, guild, "automod"), true)
        .addField("Overwrites", await displayData(event, guild, "overwrites"), true)
        .addField("Logging", await displayData(event, guild, "logging"), true)
        .addField("Filter", await displayData(event, guild, "filter"), true)
        .addField("Invite blocker", await displayData(event, guild, "antiadvert"), true)
        .setColor("#61e096")
        .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());

    await event.send(embed);
}

function mutePermissions(event: CommandEvent, role: Role, option: "set" | "remove"): void {
    const guild = event.guild;

    switch (option) {
        case "set": {
            guild.roles.cache.get(role.id)?.setPermissions("0");

            guild.channels.cache.forEach(async (channel) => {
                if (channel.type === "GUILD_CATEGORY") {
                    await channel.permissionOverwrites.edit(role, {
                        "SEND_MESSAGES": false,
                        "ADD_REACTIONS": false,
                        "USE_PUBLIC_THREADS": false,
                        "USE_PRIVATE_THREADS": false,
                        "SPEAK": false
                    }, { reason: "Mute role setup" });
                }

                if (channel.type === "GUILD_TEXT" && !channel.permissionsLocked) {
                    await channel.permissionOverwrites.edit(role, {
                        "SEND_MESSAGES": false,
                        "ADD_REACTIONS": false
                    }, { reason: "Mute role setup" });
                }

                if (channel.isVoice() && !channel.permissionsLocked) {
                    await channel.permissionOverwrites.edit(role, {
                        "SPEAK": false,
                        "STREAM": false
                    }, { reason: "Mute role setup" });
                }
            });
            break;
        }

        case "remove": {
            guild.channels.cache.forEach((channel) => {
                if (channel.type === "GUILD_CATEGORY") {
                    channel.permissionOverwrites.delete(role.id);
                }

                if (!channel.isThread() && !channel.permissionsLocked) {
                    channel.permissionOverwrites.delete(role.id);
                }
            });
            break;
        }
    }
}

async function displayData(event: CommandEvent, guild: Guild, type: DisplayData, specific?: boolean): Promise<any> {
    const client = event.client;
    const database = client.database;
    if (!specific) {
        switch (type.toLowerCase()) {
            case "prefix": {
                return guild.config.prefix ?? client.config.prefix;
            }

            case "moderators": {
                const mods = guild.config.roles?.moderator;
                if (!mods || mods.length === 0) {
                    return "There is no moderator roles.";
                }

                let list = "";
                for (const mod of mods) {
                    const role = event.guild.roles.cache.get(mod);
                    if (!role) {
                        await database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } });
                    } else {
                        list += `${role.name}\n`;
                    }
                }

                return list;
            }

            case "muterole": {
                if (!guild.config.roles) {
                    return "Not set up";
                }

                const id = guild.config.roles.muted;
                if (!id) {
                    return "No mute role";
                }

                const role = event.guild.roles.cache.get(id);
                if (!role) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } });
                    return "No mute role";
                }

                return role.name;
            }

            case "automod": {
                return guild.config.automod?.enabled === true ? "Enabled" : "Disabled";
            }

            case "filter": {
                if (!guild.config.automod?.filter) {
                    return "Not set up";
                }

                return guild.config.automod.filter.enabled ? "Enabled" : "Disabled";
            }

            case "overwrites": {
                let list = "";
                list += `${guild.config.options?.staffBypass === true ? "Enabled" : "Disabled"}\n`;

                return list;
            }

            case "logging": {
                return guild.config.logging?.enabled === true ? "Enabled" : "Disabled";
            }

            case "antiadvert": {
                return guild.config.automod?.antiAdvert === true ? "Enabled" : "Disabled";
            }
        }
    } else {
        switch (type.toLowerCase()) {
            case "prefix": {
                event.send(`The prefix is currently set to \`${guild.config.prefix ?? client.config.prefix}\``);
                break;
            }

            case "moderators": {
                const mods = guild.config.roles?.moderator;
                if (!mods || mods.length === 0) {
                    event.send("There is no moderator roles.");
                    return;
                }

                const embed = new MessageEmbed()
                    .setTitle("The following roles are moderator roles:")
                    .setColor("#61e096")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());

                let list = "";
                for (const mod of mods) {
                    const role = event.guild.roles.cache.get(mod);
                    if (!role) {
                        await database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } });
                    } else {
                        list += `${role.name}\n`;
                    }
                }

                embed.setDescription(list);
                event.send(embed);
                break;
            }

            case "muterole": {
                const id = guild.config.roles?.muted;
                if (!id) {
                    event.send("There is no role set as the mute role.");
                    return;
                }

                const role = event.guild.roles.cache.get(id);
                if (!role) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } });
                    await event.send("The role that used to be the mute role was deleted or can't be found.");
                    return;
                }

                await event.send(`\`${role.name}\` is set as the mute role.`);
                break;
            }

            case "automod": {
                if (guild.config.automod?.enabled !== true) {
                    event.send("Automod is disabled.");
                    return;
                }

                const filter = guild.config.automod.filter;
                const inviteBlocker = guild.config.automod.antiAdvert;
                const embed = new MessageEmbed()
                    .setTitle("Here's a list of automod features:")
                    .addField("Word filter", `\`${(filter && filter.enabled) ? "Enabled" : "Disabled"}\``, true)
                    .addField("Ad blocker", `\`${(inviteBlocker === true) ? "Enabled" : "Disabled"}\``, true)
                    .setColor("#61e096")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());

                event.send(embed);
                break;
            }

            case "filter": {
                if (!guild.config.automod?.filter?.enabled) {
                    event.send("The filter is disabled.");
                    return;
                }

                const filter = guild.config.automod.filter.list;
                if (!filter || filter.length === 0) {
                    event.send("There is no filtered words.");
                    return;
                }

                const embed = new MessageEmbed()
                    .setTitle("The following words are filtered:")
                    .setColor("#61e096")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());

                let list = "";
                filter.forEach((word) => {
                    list += `\`${word}\` `;
                });

                embed.setDescription(list);
                event.send(embed);
                break;
            }

            case "overwrites": {
                const embed = new MessageEmbed()
                    .setTitle("These are the overwrites for this server:")
                    .addField("Staff bypass", `${guild.config.options?.staffBypass === true ? "Enabled" : "Disabled"}`, true)
                    .setColor("#61e096")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());

                event.send(embed);
                break;
            }

            case "logging": {
                const embed = new MessageEmbed()
                    .setTitle("This is the list of logging modules for this server:")
                    .addField("Edits / Deletions", await checkLoggingChannels(event, database, guild, "editLogs"), true)
                    .addField("Bulk deletes", await checkLoggingChannels(event, database, guild, "bulkDeletes"), true)
                    .addField("Mod actions", await checkLoggingChannels(event, database, guild, "modActions"), true)
                    .addField("Command used", await checkLoggingChannels(event, database, guild, "commandUsed"), true)
                    .addField("Name changes", await checkLoggingChannels(event, database, guild, "nameChanges"), true)
                    .addField("Role changes", await checkLoggingChannels(event, database, guild, "roleChanges"), true)
                    .addField("Guild changes", await checkLoggingChannels(event, database, guild, "guildChanges"), true)
                    .addField("Channel changes", await checkLoggingChannels(event, database, guild, "channelChanges"), true)
                    .addField("Voice changes", await checkLoggingChannels(event, database, guild, "voiceChanges"), true)
                    .addField("Joins", await checkLoggingChannels(event, database, guild, "travelLogs"), true)
                    .setColor("#61e096")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());

                await event.send(embed);
                break;
            }

            case "antiadvert": {
                await event.send(`${guild.config.automod?.antiAdvert === true ? "The anti-advert is enabled." : "The anti-advert is disabled."}`);
                break;
            }
        }
    }
    return;
}

async function checkLoggingChannels(event: CommandEvent, database: Database, guild: Guild, type: LoggingType) {
    if (!guild.config.logging || !guild.config.logging[type]) {
        return "Not set";
    }

    const channel = event.guild.channels.cache.get(guild.config.logging[type]!);
    if (!channel) {
        await database.guilds.updateOne({ id: guild.id }, { "$unset": { [`config.logging.${type}`]: "" } });
        return "Not set";
    }

    return `<#${channel.id}>`;
}
