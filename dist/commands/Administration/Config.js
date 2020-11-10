"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
const Guild_1 = require("../../models/Guild");
const discord_js_1 = require("discord.js");
const Utils_1 = require("../../utils/Utils");
class Config extends Command_1.default {
    constructor() {
        super({ name: "Config", triggers: ["config", "cfg", "setup"], description: "Configures various settings for the guild", group: Groups_1.Administration });
    }
    async run(event) {
        const client = event.client;
        const database = client.database;
        let guild = await database.guilds.findOne({ id: event.guild.id });
        if (!guild) {
            const newguild = new Guild_1.Guild({ id: event.guild.id });
            await database.guilds.insertOne(newguild);
            guild = await database.guilds.findOne({ id: event.guild.id });
        }
        const [subcommand, option, args] = event.argument.split(/\s+/, 3);
        if (!subcommand) {
            displayAllSettings(event, guild);
        }
        switch (subcommand.toLowerCase()) {
            case "prefix": {
                prefixSettings(event, option, args, guild);
                break;
            }
            case "mod":
            case "mods":
            case "moderator":
            case "moderators":
            case "staff": {
                moderatorSettings(event, option, args, guild);
                break;
            }
            case "mute":
            case "muted":
            case "muterole": {
                muteSettings(event, option, args, guild);
                break;
            }
            case "automod": {
                automodSettings(event, option, guild);
                break;
            }
            case "badwords":
            case "filter": {
                filterSettings(event, option, args, guild);
                break;
            }
            case "overwrites":
            case "overwrite":
            case "special": {
                overwriteSettings(event, option, args, guild);
                break;
            }
            case "log":
            case "logs":
            case "logging": {
                loggingSettings(event, option, args, guild);
                break;
            }
            case "invite":
            case "inviteblock":
            case "ads":
            case "adblock":
            case "inviteBlocker": {
                inviteBlockerSettings(event, option, guild);
            }
        }
    }
}
exports.default = Config;
async function prefixSettings(event, option, args, guild) {
    const client = event.client;
    const database = client.database;
    if (!option) {
        Utils_1.displayData(event, guild, "prefix", true);
        return;
    }
    switch (option.toLowerCase()) {
        case "set": {
            if (args.length > 5) {
                event.send("The prefix can be up to 5 characters.");
                break;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild === null || guild === void 0 ? void 0 : guild.id }, { "$set": { "config.prefix": args } }));
            event.send(`The prefix has been set to \`${args}\``);
            break;
        }
        case "reset": {
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild === null || guild === void 0 ? void 0 : guild.id }, { "$unset": { "config.prefix": "" } }));
            event.send(`The prefix has been set to \`${client.config.prefix}\``);
            break;
        }
    }
}
async function moderatorSettings(event, option, args, guild) {
    var _a, _b, _c, _d;
    const database = event.client.database;
    Utils_1.databaseCheck(database, guild, "moderator");
    if (!option) {
        Utils_1.displayData(event, guild, "moderators", true);
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
            if ((_b = (_a = guild.config.roles) === null || _a === void 0 ? void 0 : _a.moderator) === null || _b === void 0 ? void 0 : _b.includes(role.id)) {
                event.send("The specified role is already a moderator role.");
                break;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$push": { "config.roles.moderator": role.id } }));
            event.send(`Added \`${role.name}\` as a moderator role.`);
            break;
        }
        case "remove": {
            if (!((_d = (_c = guild.config.roles) === null || _c === void 0 ? void 0 : _c.moderator) === null || _d === void 0 ? void 0 : _d.includes(role.id))) {
                event.send("The specified role isn't a moderator role.");
                break;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": role.id } }));
            event.send(`\`${role.name}\` is no longer a moderator role.`);
            break;
        }
    }
}
async function muteSettings(event, option, args, guild) {
    var _a, _b, _c, _d;
    const database = event.client.database;
    Utils_1.databaseCheck(database, guild, "roles");
    if (!option) {
        Utils_1.displayData(event, guild, "muterole", true);
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
            if (((_a = guild.config.roles) === null || _a === void 0 ? void 0 : _a.muted) === role.id) {
                event.send("The specified role is already set as the mute role.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.muted": role.id } }));
            event.send(`Set \`${role.name}\` as the mute role.`);
            if (option === "setauto") {
                Utils_1.mutePermissions(event, role, "set");
                event.send(`Automatically set permission overwrites for \`${role.name}\`.`);
            }
            break;
        }
        case "autoremove":
        case "remove": {
            if (!((_b = guild.config.roles) === null || _b === void 0 ? void 0 : _b.muted)) {
                event.send("No role is specified as the mute role.");
                return;
            }
            const role = event.guild.roles.cache.get(guild.config.roles.muted);
            if (!role) {
                await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } }));
                event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } }));
            event.send(`\`${role.name}\` is no longer the mute role.`);
            if (option === "autoremove") {
                Utils_1.mutePermissions(event, role, "remove");
                event.send(`Automatically removed permission overwrites for \`${role.name}\`.`);
            }
            break;
        }
        case "perm":
        case "permissions":
        case "setperm":
        case "setpermissions": {
            if (!((_c = guild.config.roles) === null || _c === void 0 ? void 0 : _c.muted)) {
                event.send(`There is no muted role set.`);
                return;
            }
            const role = event.guild.roles.cache.get(guild.config.roles.muted);
            if (!role) {
                await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } }));
                event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }
            Utils_1.mutePermissions(event, role, "set");
            event.send(`Set permission overwrites for \`${role.name}\`.`);
            break;
        }
        case "removeperm":
        case "removepermissions": {
            if (!((_d = guild.config.roles) === null || _d === void 0 ? void 0 : _d.muted)) {
                event.send("There is no muted role set.");
                return;
            }
            const role = event.guild.roles.cache.get(guild.config.roles.muted);
            if (!role) {
                await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } }));
                event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }
            Utils_1.mutePermissions(event, role, "remove");
            event.send(`Removed permission overwrites for \`${role.name}\`.`);
            break;
        }
    }
}
async function automodSettings(event, option, guild) {
    const database = event.client.database;
    Utils_1.databaseCheck(database, guild, "automod");
    if (!option) {
        Utils_1.displayData(event, guild, "automod", true);
        return;
    }
    switch (option.toLowerCase()) {
        case "enable": {
            if (guild.config.automod === true) {
                event.send("Automod is already enabled.");
                return;
            }
            database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod": true } });
            event.send("Succefully enabled automod features.");
            break;
        }
        case "disable": {
            if (guild.config.automod !== true) {
                event.send("Automod is already disabled.");
                return;
            }
            database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.automod": "" } });
            event.send("Succefully disabled automod features.");
            break;
        }
    }
}
async function filterSettings(event, option, args, guild) {
    var _a, _b, _c, _d, _e, _f;
    const database = event.client.database;
    Utils_1.databaseCheck(database, guild, "filter");
    if (!option) {
        Utils_1.displayData(event, guild, "filter", true);
        return;
    }
    switch (option.toLowerCase()) {
        case "add": {
            const word = args;
            if (!word) {
                event.send("You need to specify a word.");
                return;
            }
            if ((_b = (_a = guild.config.filter) === null || _a === void 0 ? void 0 : _a.list) === null || _b === void 0 ? void 0 : _b.includes(word)) {
                event.send("The specified word is already filtered.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$push": { "config.automod.filter.list": word } }));
            event.send(`Added \`${word}\` to the filter.`);
            break;
        }
        case "remove": {
            const word = args;
            if (!word) {
                event.send("You need to specify a word.");
                return;
            }
            if (!((_d = (_c = guild.config.filter) === null || _c === void 0 ? void 0 : _c.list) === null || _d === void 0 ? void 0 : _d.includes(word))) {
                event.send("The specified word isn't filtered.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.automod.filter.list": word } }));
            event.send(`Removed \`${word}\` from the filter.`);
            break;
        }
        case "enable": {
            if ((_e = guild.config.filter) === null || _e === void 0 ? void 0 : _e.enabled) {
                event.send("The word filter is already enabled.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod.filter.enabled": true } }));
            event.send("Enabled the word filter.");
            break;
        }
        case "disable": {
            if (!((_f = guild.config.filter) === null || _f === void 0 ? void 0 : _f.enabled)) {
                event.send("The word filter is already disabled.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod.filter.enabled": false } }));
            event.send("Disabled the word filter.");
            break;
        }
    }
}
async function inviteBlockerSettings(event, option, guild) {
    const database = event.client.database;
    Utils_1.databaseCheck(database, guild, "inviteblocker");
    if (!option) {
        Utils_1.displayData(event, guild, "inviteblocker", true);
    }
    switch (option) {
        case "enable": {
            if (guild.config.inviteBlocker === true) {
                event.send("The invite blocker is already enabled");
                return;
            }
            database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.inviteBlocker": true } });
            event.send("The invite blocker has been enabled.");
            break;
        }
        case "disable": {
            if (guild.config.inviteBlocker !== true) {
                event.send("The invite blocker is already disabled");
                return;
            }
            database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.inviteBlocker": "" } });
            event.send("The invite blocker has been disabled.");
            break;
        }
    }
}
async function overwriteSettings(event, option, args, guild) {
    const database = event.client.database;
    if (!option) {
        Utils_1.displayData(event, guild, "overwrites", true);
        return;
    }
    switch (option.toLowerCase()) {
        case "staffbypass": {
            const value = args;
            switch (value) {
                case "enable": {
                    if (guild.config.staffBypass === true) {
                        event.send("Staff's ability to bypass automod is already enabled.");
                        return;
                    }
                    database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.staffBypass": true } });
                    event.send("Enabled staff's ability to bypass automod.");
                    break;
                }
                case "disable": {
                    if (!guild.config.staffBypass) {
                        event.send("Staff's ability to bypass automod is already disabled.");
                        return;
                    }
                    database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.staffBypass": "" } });
                    event.send("Disabled staff's ability to bypass automod.");
                    break;
                }
            }
        }
    }
}
async function loggingSettings(event, option, args, guild) {
    const database = event.client.database;
    Utils_1.databaseCheck(database, guild, "channels");
    if (!option) {
        Utils_1.displayData(event, guild, "logging", true);
        return;
    }
    if (!args) {
        event.send("You need to specify a type and the channel it will be logged in.");
        return;
    }
    const [type, id] = args.split(/\s+/, 2);
    const log = Utils_1.convertLogging(type);
    if (log === "None") {
        event.send("You need to specify a valid logging type.");
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
            if (log.length === 1 && guild.config.channels[log[0]] === channel.id) {
                event.send("This channel is already set for this logging type");
                return;
            }
            log.forEach(async (logtype) => {
                if (guild.config.channels[logtype] === channel.id) {
                    event.send("This channel is already set for this logging type");
                    return;
                }
                await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { [`config.channels.${logtype}`]: channel.id } }));
                event.send(`"Successfully added \`${logtype}\` to <#${channel.id}>.`);
            });
        }
        case "remove": {
            if (log.length === 1 && guild.config.channels[log[0]] === undefined) {
                event.send("This logging type has no specified channel already.");
                return;
            }
            log.forEach(async (logtype) => {
                await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { [`config.channels.${log}`]: "" } }));
                event.send(`"Successfully removed \`${logtype}\` from the channel it was bound to.`);
            });
        }
    }
}
async function displayAllSettings(event, guild) {
    const embed = new discord_js_1.MessageEmbed()
        .setTitle("The current settings for this server:")
        .addField("Prefix", await Utils_1.displayData(event, guild, "prefix"), true)
        .addField("Moderators", await Utils_1.displayData(event, guild, "moderators"), true)
        .addField("Mute role", await Utils_1.displayData(event, guild, "muterole"), true)
        .addField("Automod", await Utils_1.displayData(event, guild, "automod"), true)
        .addField("Overwrites", await Utils_1.displayData(event, guild, "overwrites"), true)
        .addField("Logging", await Utils_1.displayData(event, guild, "logging"), true)
        .addField("Filter", await Utils_1.displayData(event, guild, "filter"), true)
        .addField("Invite blocker", await Utils_1.displayData(event, guild, "inviteblocker"), true)
        .setColor("#61e096")
        .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());
    event.send({ embed: embed });
}
//# sourceMappingURL=Config.js.map