import Command from "@command/Command";
import {Administration} from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import {Guild} from "@models/Guild";
import {MessageEmbed} from "discord.js";
import {convertLogging, databaseCheck, displayData, mutePermissions} from "@utils/CommandUtils";
import {splitArguments} from "@utils/Utils";

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
        const database = client.database;

        const guild = await client.getGuildFromDatabase(database!, event.guild.id);
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
                await overwriteSettings(event, option, args, guild!);
                break;
            }

            case "log":
            case "logs":
            case "logging": {
                await loggingSettings(event, option, args, guild!);
                break;
            }

            case "invite":
            case "inviteblock":
            case "ads":
            case "adblock":
            case "inviteblocker": {
                await inviteBlockerSettings(event, option, guild!);
                break;
            }
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
                await event.send("The prefix can be up to 5 characters.");
                break;
            }

            await database?.guilds.updateOne({id: guild?.id}, {"$set": {"config.prefix": args}});
            await event.send(`The prefix has been set to \`${args}\``);
            break;
        }

        case "reset": {
            await database?.guilds.updateOne({id: guild?.id}, {"$unset": {"config.prefix": ""}});
            await event.send(`The prefix has been set to \`${client.config.prefix}\``);
            break;
        }
    }
}

async function moderatorSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;
    await databaseCheck(database!, guild, "moderator");

    if (!option) {
        await displayData(event, guild, "moderators", true);
        return;
    }

    if (!args) {
        await event.send("You need to specify a role.");
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

            await database?.guilds.updateOne({id: guild.id}, {"$push": {"config.roles.moderator": role.id}});
            await event.send(`Added \`${role.name}\` as a moderator role.`);
            break;
        }
        case "remove": {
            if (!guild.config.roles?.moderator?.includes(role.id)) {
                await event.send("The specified role isn't a moderator role.");
                break;
            }

            await database?.guilds.updateOne({id: guild.id}, {"$pull": {"config.roles.moderator": role.id}});
            await event.send(`\`${role.name}\` is no longer a moderator role.`);
            break;
        }
    }
}

async function muteSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;
    await databaseCheck(database!, guild, "roles");

    if (!option) {
        await displayData(event, guild, "muteRole", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "setauto":
        case "set": {
            const muted = args;

            if (!muted) {
                await event.send("You need to specify a role.");
                return;
            }

            const role = event.guild.roles.cache.find(role => role.id === muted || role.name === muted || `<@&${role.id}>` === muted);

            if (!role) {
                await event.send("Couldn't find the role you're looking for.");
                return;
            }

            if (guild.config.roles?.muted === role.id) {
                await event.send("The specified role is already set as the mute role.");
                return;
            }

            await database?.guilds.updateOne({id: guild.id}, {"$set": {"config.roles.muted": role.id}});
            await event.send(`Set \`${role.name}\` as the mute role.`);

            if (option === "setauto") {
                mutePermissions(event, role, "set");
                await event.send(`Automatically set permission overwrites for \`${role.name}\`.`);
            }
            break;
        }

        case "autoremove":
        case "remove": {
            if (!guild.config.roles?.muted) {
                await event.send("No role is specified as the mute role.");
                return;
            }

            const role = event.guild.roles.cache.get(guild.config.roles.muted);
            if (!role) {
                await database?.guilds.updateOne({id: guild.id}, {"$unset": {"config.roles.muted": ""}});
                await event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }

            await database?.guilds.updateOne({id: guild.id}, {"$unset": {"config.roles.muted": ""}});
            await event.send(`\`${role.name}\` is no longer the mute role.`);

            if (option === "autoremove") {
                mutePermissions(event, role, "remove");
                await event.send(`Automatically removed permission overwrites for \`${role.name}\`.`);
            }
            break;
        }

        case "perm":
        case "permissions":
        case "setperm":
        case "setpermissions": {
            if (!guild.config.roles?.muted) {
                await event.send("There is no muted role set.");
                return;
            }

            const role = event.guild.roles.cache.get(guild.config.roles.muted);
            if (!role) {
                await database?.guilds.updateOne({id: guild.id}, {"$unset": {"config.roles.muted": ""}});
                await event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }

            mutePermissions(event, role, "set");
            await event.send(`Set permission overwrites for \`${role.name}\`.`);
            break;
        }

        case "removeperm":
        case "removepermissions": {
            if (!guild.config.roles?.muted) {
                await event.send("There is no muted role set.");
                return;
            }

            const role = event.guild.roles.cache.get(guild.config.roles.muted);
            if (!role) {
                await database?.guilds.updateOne({id: guild.id}, {"$unset": {"config.roles.muted": ""}});
                await event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }

            mutePermissions(event, role, "remove");
            await event.send(`Removed permission overwrites for \`${role.name}\`.`);
            break;
        }
    }
}

async function autoModSettings(event: CommandEvent, option: string, guild: Guild) {
    const database = event.client.database;
    await databaseCheck(database!, guild, "autoMod");

    if (!option) {
        await displayData(event, guild, "autoMod", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "enable": {
            if (guild.config.automod === true) {
                await event.send("Automod is already enabled.");
                return;
            }

            database?.guilds.updateOne({id: guild.id}, {"$set": {"config.automod": true}});
            await event.send("Successfully enabled automod features.");
            break;
        }

        case "disable": {
            if (guild.config.automod !== true) {
                await event.send("Automod is already disabled.");
                return;
            }

            database?.guilds.updateOne({id: guild.id}, {"$unset": {"config.automod": ""}});
            await event.send("Successfully disabled automod features.");
            break;
        }
    }
}

async function filterSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;
    await databaseCheck(database!, guild, "filter");

    if (!option) {
        await displayData(event, guild, "filter", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "add": {
            const word = args;

            if (!word) {
                await event.send("You need to specify a word.");
                return;
            }

            if (guild.config.filter?.list?.includes(word)) {
                await event.send("The specified word is already filtered.");
                return;
            }

            await database?.guilds.updateOne({id: guild.id}, {"$push": {"config.filter.list": word}});
            await event.send(`Added \`${word}\` to the filter.`);
            break;
        }

        case "remove": {
            const word = args;
            if (!word) {
                await event.send("You need to specify a word.");
                return;
            }

            if (!guild.config.filter?.list?.includes(word)) {
                await event.send("The specified word isn't filtered.");
                return;
            }

            await database?.guilds.updateOne({id: guild.id}, {"$pull": {"config.filter.list": word}});
            await event.send(`Removed \`${word}\` from the filter.`);
            break;
        }

        case "enable": {
            if (guild.config.filter?.enabled) {
                await event.send("The word filter is already enabled.");
                return;
            }

            await database?.guilds.updateOne({id: guild.id}, {"$set": {"config.filter.enabled": true}});
            await event.send("Enabled the word filter.");
            break;
        }

        case "disable": {
            if (!guild.config.filter?.enabled) {
                await event.send("The word filter is already disabled.");
                return;
            }

            await database?.guilds.updateOne({id: guild.id}, {"$set": {"config.filter.enabled": false}});
            await event.send("Disabled the word filter.");
            break;
        }
    }
}

async function inviteBlockerSettings(event: CommandEvent, option: string, guild: Guild) {
    const database = event.client.database;
    await databaseCheck(database!, guild, "inviteBlocker");

    if (!option) {
        await displayData(event, guild, "inviteBlocker", true);
    }

    switch (option) {
        case "enable": {
            if (guild.config.inviteBlocker === true) {
                await event.send("The invite blocker is already enabled");
                return;
            }

            database?.guilds.updateOne({id: guild.id}, {"$set": {"config.inviteBlocker": true}});
            await event.send("The invite blocker has been enabled.");
            break;
        }

        case "disable": {
            if (guild.config.inviteBlocker !== true) {
                await event.send("The invite blocker is already disabled");
                return;
            }

            database?.guilds.updateOne({id: guild.id}, {"$unset": {"config.inviteBlocker": ""}});
            await event.send("The invite blocker has been disabled.");
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
                    if (guild.config.staffBypass === true) {
                        await event.send("Staff's ability to bypass automod is already enabled.");
                        return;
                    }

                    database?.guilds.updateOne({id: guild.id}, {"$set": {"config.staffBypass": true}});
                    await event.send("Enabled staff's ability to bypass automod.");
                    break;
                }

                case "disable": {
                    if (!guild.config.staffBypass) {
                        await event.send("Staff's ability to bypass automod is already disabled.");
                        return;
                    }

                    database?.guilds.updateOne({id: guild.id}, {"$unset": {"config.staffBypass": ""}});
                    await event.send("Disabled staff's ability to bypass automod.");
                    break;
                }
            }
        }
    }
}

async function loggingSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;
    await databaseCheck(database!, guild, "channels");

    if (!option) {
        await displayData(event, guild, "logging", true);
        return;
    }

    if (!args) {
        await event.send("You need to specify a type.");
        return;
    }

    const [type, id] = args.split(/\s+/, 2);
    const log = convertLogging(type);

    if (log === "None") {
        await event.send("You need to specify a valid logging type.");
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            if (!id) {
                await event.send("You need to specify the channel that this type will be logged in.");
                return;
            }

            const channel = event.guild.channels.cache.find(channel => channel.name === id || `<#${channel.id}>` === id);
            if (!channel) {
                await event.send("Couldn't find the channel you're looking for.");
                return;
            }


            if (log.length === 1 && guild.config.channels![log[0]] === channel.id) {
                await event.send("This logging type is already enabled in this channel.");
                return;
            }

            const successful = [], failed = [];
            for (const logType of log) {

                if (guild.config.channels![logType] === channel.id) {
                    failed.push(logType);
                    continue;
                }

                await database?.guilds.updateOne({id: guild.id}, {"$set": {[`config.channels.${logType}`]: channel.id}});
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
            if (log.length === 1 && guild.config.channels![log[0]] === undefined) {
                await event.send("This logging type is already disabled.");
                return;
            }

            for (const logType of log) {
                if (guild.config.channels![logType] === undefined) {
                    failed.push(logType);
                    continue;
                }

                await database?.guilds.updateOne({id: guild.id}, {"$unset": {[`config.channels.${logType}`]: ""}});
                successful.push(logType);
            }

            let message = "";
            if (successful.length > 0) {
                message += `Successfully disabled \`${successful.join("`, `")}\`. `;
            }

            if (failed.length > 0) {
                message += `\`${failed.join("`, `")}\` ${failed.length === 1 ? "was" : "were"} already disabled.`;
            }

            await event.send(message);
            break;
        }
    }
}

async function displayAllSettings(event: CommandEvent, guild: Guild) {
    const embed = new MessageEmbed()
        .setTitle("The current settings for this server:")
        .addField("Prefix", await displayData(event, guild, "prefix"), true)
        .addField("Moderators", await displayData(event, guild, "moderators"), true)
        .addField("Mute role", await displayData(event, guild, "muteRole"), true)
        .addField("Automod", await displayData(event, guild, "autoMod"), true)
        .addField("Overwrites", await displayData(event, guild, "overwrites"), true)
        .addField("Logging", await displayData(event, guild, "logging"), true)
        .addField("Filter", await displayData(event, guild, "filter"), true)
        .addField("Invite blocker", await displayData(event, guild, "inviteBlocker"), true)
        .setColor("#61e096")
        .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());

    await event.send({embed: embed});
}
