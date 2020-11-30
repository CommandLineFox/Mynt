"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
const discord_js_1 = require("discord.js");
const CommandUtils_1 = require("../../utils/CommandUtils");
const Utils_1 = require("../../utils/Utils");
class Config extends Command_1.default {
    constructor() {
        super({
            name: "Config",
            triggers: ["config", "cfg", "setup"],
            description: "Configures various settings for the guild",
            group: Groups_1.Administration,
            botPermissions: ["EMBED_LINKS", "MANAGE_ROLES"]
        });
    }
    async run(event) {
        const client = event.client;
        const database = client.database;
        const guild = await client.getGuildFromDatabase(database, event.guild.id);
        if (!guild) {
            return;
        }
        const [subcommand, option, args] = Utils_1.splitArguments(event.argument, 3);
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
            case "adblock":
            case "inviteblocker": {
                await inviteBlockerSettings(event, option, guild);
                break;
            }
        }
    }
}
exports.default = Config;
async function prefixSettings(event, option, args, guild) {
    const client = event.client;
    const database = client.database;
    if (!option) {
        await CommandUtils_1.displayData(event, guild, "prefix", true);
        return;
    }
    switch (option.toLowerCase()) {
        case "set": {
            if (args.length > 5) {
                await event.send("The prefix can be up to 5 characters.");
                break;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild === null || guild === void 0 ? void 0 : guild.id }, { "$set": { "config.prefix": args } }));
            await event.send(`The prefix has been set to \`${args}\``);
            break;
        }
        case "reset": {
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild === null || guild === void 0 ? void 0 : guild.id }, { "$unset": { "config.prefix": "" } }));
            await event.send(`The prefix has been set to \`${client.config.prefix}\``);
            break;
        }
    }
}
async function moderatorSettings(event, option, args, guild) {
    var _a, _b, _c, _d;
    const database = event.client.database;
    await CommandUtils_1.databaseCheck(database, guild, "moderator");
    if (!option) {
        await CommandUtils_1.displayData(event, guild, "moderators", true);
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
            if ((_b = (_a = guild.config.roles) === null || _a === void 0 ? void 0 : _a.moderator) === null || _b === void 0 ? void 0 : _b.includes(role.id)) {
                await event.send("The specified role is already a moderator role.");
                break;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$push": { "config.roles.moderator": role.id } }));
            await event.send(`Added \`${role.name}\` as a moderator role.`);
            break;
        }
        case "remove": {
            if (!((_d = (_c = guild.config.roles) === null || _c === void 0 ? void 0 : _c.moderator) === null || _d === void 0 ? void 0 : _d.includes(role.id))) {
                await event.send("The specified role isn't a moderator role.");
                break;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": role.id } }));
            await event.send(`\`${role.name}\` is no longer a moderator role.`);
            break;
        }
    }
}
async function muteSettings(event, option, args, guild) {
    var _a, _b, _c, _d;
    const database = event.client.database;
    await CommandUtils_1.databaseCheck(database, guild, "roles");
    if (!option) {
        await CommandUtils_1.displayData(event, guild, "muteRole", true);
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
            if (((_a = guild.config.roles) === null || _a === void 0 ? void 0 : _a.muted) === role.id) {
                await event.send("The specified role is already set as the mute role.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.muted": role.id } }));
            await event.send(`Set \`${role.name}\` as the mute role.`);
            if (option === "setauto") {
                CommandUtils_1.mutePermissions(event, role, "set");
                await event.send(`Automatically set permission overwrites for \`${role.name}\`.`);
            }
            break;
        }
        case "autoremove":
        case "remove": {
            if (!((_b = guild.config.roles) === null || _b === void 0 ? void 0 : _b.muted)) {
                await event.send("No role is specified as the mute role.");
                return;
            }
            const role = event.guild.roles.cache.get(guild.config.roles.muted);
            if (!role) {
                await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } }));
                await event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } }));
            await event.send(`\`${role.name}\` is no longer the mute role.`);
            if (option === "autoremove") {
                CommandUtils_1.mutePermissions(event, role, "remove");
                await event.send(`Automatically removed permission overwrites for \`${role.name}\`.`);
            }
            break;
        }
        case "perm":
        case "permissions":
        case "setperm":
        case "setpermissions": {
            if (!((_c = guild.config.roles) === null || _c === void 0 ? void 0 : _c.muted)) {
                await event.send("There is no muted role set.");
                return;
            }
            const role = event.guild.roles.cache.get(guild.config.roles.muted);
            if (!role) {
                await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } }));
                await event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }
            CommandUtils_1.mutePermissions(event, role, "set");
            await event.send(`Set permission overwrites for \`${role.name}\`.`);
            break;
        }
        case "removeperm":
        case "removepermissions": {
            if (!((_d = guild.config.roles) === null || _d === void 0 ? void 0 : _d.muted)) {
                await event.send("There is no muted role set.");
                return;
            }
            const role = event.guild.roles.cache.get(guild.config.roles.muted);
            if (!role) {
                await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } }));
                await event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }
            CommandUtils_1.mutePermissions(event, role, "remove");
            await event.send(`Removed permission overwrites for \`${role.name}\`.`);
            break;
        }
    }
}
async function autoModSettings(event, option, guild) {
    const database = event.client.database;
    await CommandUtils_1.databaseCheck(database, guild, "autoMod");
    if (!option) {
        await CommandUtils_1.displayData(event, guild, "autoMod", true);
        return;
    }
    switch (option.toLowerCase()) {
        case "enable": {
            if (guild.config.automod === true) {
                await event.send("Automod is already enabled.");
                return;
            }
            database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod": true } });
            await event.send("Successfully enabled automod features.");
            break;
        }
        case "disable": {
            if (guild.config.automod !== true) {
                await event.send("Automod is already disabled.");
                return;
            }
            database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.automod": "" } });
            await event.send("Successfully disabled automod features.");
            break;
        }
    }
}
async function filterSettings(event, option, args, guild) {
    var _a, _b, _c, _d, _e, _f;
    const database = event.client.database;
    await CommandUtils_1.databaseCheck(database, guild, "filter");
    if (!option) {
        await CommandUtils_1.displayData(event, guild, "filter", true);
        return;
    }
    switch (option.toLowerCase()) {
        case "add": {
            const word = args;
            if (!word) {
                await event.send("You need to specify a word.");
                return;
            }
            if ((_b = (_a = guild.config.filter) === null || _a === void 0 ? void 0 : _a.list) === null || _b === void 0 ? void 0 : _b.includes(word)) {
                await event.send("The specified word is already filtered.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$push": { "config.filter.list": word } }));
            await event.send(`Added \`${word}\` to the filter.`);
            break;
        }
        case "remove": {
            const word = args;
            if (!word) {
                await event.send("You need to specify a word.");
                return;
            }
            if (!((_d = (_c = guild.config.filter) === null || _c === void 0 ? void 0 : _c.list) === null || _d === void 0 ? void 0 : _d.includes(word))) {
                await event.send("The specified word isn't filtered.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.filter.list": word } }));
            await event.send(`Removed \`${word}\` from the filter.`);
            break;
        }
        case "enable": {
            if ((_e = guild.config.filter) === null || _e === void 0 ? void 0 : _e.enabled) {
                await event.send("The word filter is already enabled.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.filter.enabled": true } }));
            await event.send("Enabled the word filter.");
            break;
        }
        case "disable": {
            if (!((_f = guild.config.filter) === null || _f === void 0 ? void 0 : _f.enabled)) {
                await event.send("The word filter is already disabled.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.filter.enabled": false } }));
            await event.send("Disabled the word filter.");
            break;
        }
    }
}
async function inviteBlockerSettings(event, option, guild) {
    const database = event.client.database;
    await CommandUtils_1.databaseCheck(database, guild, "inviteBlocker");
    if (!option) {
        await CommandUtils_1.displayData(event, guild, "inviteBlocker", true);
    }
    switch (option) {
        case "enable": {
            if (guild.config.inviteBlocker === true) {
                await event.send("The invite blocker is already enabled");
                return;
            }
            database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.inviteBlocker": true } });
            await event.send("The invite blocker has been enabled.");
            break;
        }
        case "disable": {
            if (guild.config.inviteBlocker !== true) {
                await event.send("The invite blocker is already disabled");
                return;
            }
            database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.inviteBlocker": "" } });
            await event.send("The invite blocker has been disabled.");
            break;
        }
    }
}
async function overwriteSettings(event, option, args, guild) {
    const database = event.client.database;
    if (!option) {
        await CommandUtils_1.displayData(event, guild, "overwrites", true);
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
                    database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.staffBypass": true } });
                    await event.send("Enabled staff's ability to bypass automod.");
                    break;
                }
                case "disable": {
                    if (!guild.config.staffBypass) {
                        await event.send("Staff's ability to bypass automod is already disabled.");
                        return;
                    }
                    database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.staffBypass": "" } });
                    await event.send("Disabled staff's ability to bypass automod.");
                    break;
                }
            }
        }
    }
}
async function loggingSettings(event, option, args, guild) {
    const database = event.client.database;
    await CommandUtils_1.databaseCheck(database, guild, "channels");
    if (!option) {
        await CommandUtils_1.displayData(event, guild, "logging", true);
        return;
    }
    if (!args) {
        await event.send("You need to specify a type.");
        return;
    }
    const [type, id] = args.split(/\s+/, 2);
    const log = CommandUtils_1.convertLogging(type);
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
            if (log.length === 1 && guild.config.channels[log[0]] === channel.id) {
                await event.send("This logging type is already enabled in this channel.");
                return;
            }
            const successful = [], failed = [];
            for (const logType of log) {
                if (guild.config.channels[logType] === channel.id) {
                    failed.push(logType);
                    continue;
                }
                await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { [`config.channels.${logType}`]: channel.id } }));
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
            if (log.length === 1 && guild.config.channels[log[0]] === undefined) {
                await event.send("This logging type is already disabled.");
                return;
            }
            for (const logType of log) {
                if (guild.config.channels[logType] === undefined) {
                    failed.push(logType);
                    continue;
                }
                await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { [`config.channels.${logType}`]: "" } }));
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
async function displayAllSettings(event, guild) {
    const embed = new discord_js_1.MessageEmbed()
        .setTitle("The current settings for this server:")
        .addField("Prefix", await CommandUtils_1.displayData(event, guild, "prefix"), true)
        .addField("Moderators", await CommandUtils_1.displayData(event, guild, "moderators"), true)
        .addField("Mute role", await CommandUtils_1.displayData(event, guild, "muteRole"), true)
        .addField("Automod", await CommandUtils_1.displayData(event, guild, "autoMod"), true)
        .addField("Overwrites", await CommandUtils_1.displayData(event, guild, "overwrites"), true)
        .addField("Logging", await CommandUtils_1.displayData(event, guild, "logging"), true)
        .addField("Filter", await CommandUtils_1.displayData(event, guild, "filter"), true)
        .addField("Invite blocker", await CommandUtils_1.displayData(event, guild, "inviteBlocker"), true)
        .setColor("#61e096")
        .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());
    await event.send({ embed: embed });
}
//# sourceMappingURL=Config.js.map