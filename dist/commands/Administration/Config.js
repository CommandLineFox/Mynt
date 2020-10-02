"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
const Guild_1 = require("../../models/Guild");
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
        switch (subcommand) {
            case "prefix": {
                prefixSettings(event, args, guild);
                break;
            }
            case "moderator":
            case "mods":
            case "moderators":
            case "staff": {
                moderatorSettings(event, option, args, guild);
                break;
            }
            case "mute":
            case "muted": {
                muteSettings(event, option, args, guild);
                break;
            }
            case "holyshitwhatthefuckdidyoujustsaytome":
            case "badwords":
            case "filter": {
                filterSettings(event, option, args, guild);
                break;
            }
        }
    }
}
exports.default = Config;
async function prefixSettings(event, args, guild) {
    const client = event.client;
    const database = client.database;
    const prefix = args;
    if (!prefix) {
        event.send(`The prefix is currently set to \`${(guild === null || guild === void 0 ? void 0 : guild.config.prefix) || client.config.prefix}\``);
        return;
    }
    if (prefix.length > 5) {
        event.send("The prefix can be up to 5 characters.");
        return;
    }
    if (prefix.toLowerCase() === "reset") {
        await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild === null || guild === void 0 ? void 0 : guild.id }, { "$set": { "config.prefix": client.config.prefix } }));
        event.send(`The prefix has been set to \`${client.config.prefix}\``);
        return;
    }
    await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild === null || guild === void 0 ? void 0 : guild.id }, { "$set": { "config.prefix": prefix } }));
    event.send(`The prefix has been set to \`${prefix}\``);
}
async function moderatorSettings(event, option, args, guild) {
    var _a, _b, _c, _d, _e;
    const database = event.client.database;
    if (!option) {
        const mods = (_a = guild === null || guild === void 0 ? void 0 : guild.config.roles) === null || _a === void 0 ? void 0 : _a.moderator;
        if (!mods || mods.length === 0) {
            event.send("There is no moderator roles.");
            return;
        }
        let list = `**The following roles are moderator roles:**\n`;
        mods.forEach((mod) => {
            const role = event.guild.roles.cache.get(mod);
            if (!role) {
                database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$pull": { "config.roles.moderator": mod } });
            }
            else {
                list += `${role.name}\n`;
            }
        });
        event.send(list);
        return;
    }
    databaseCheck(database, guild, "moderator");
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
            if ((_c = (_b = guild.config.roles) === null || _b === void 0 ? void 0 : _b.moderator) === null || _c === void 0 ? void 0 : _c.includes(role.id)) {
                event.send('The specified role is already a moderator role.');
                break;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$push": { "config.roles.moderator": role.id } }));
            event.send(`Added \`${role.name}\` as a moderator role.`);
            break;
        }
        case "remove": {
            if (!((_e = (_d = guild.config.roles) === null || _d === void 0 ? void 0 : _d.moderator) === null || _e === void 0 ? void 0 : _e.includes(role.id))) {
                event.send('The specified role is not a moderator role.');
                break;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$pull": { "config.roles.moderator": role.id } }));
            event.send(`\`${role.name}\` is no longer a moderator role.`);
            break;
        }
    }
}
async function muteSettings(event, option, args, guild) {
    var _a, _b, _c, _d, _e;
    const database = event.client.database;
    if (!option) {
        const id = (_a = guild === null || guild === void 0 ? void 0 : guild.config.roles) === null || _a === void 0 ? void 0 : _a.muted;
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
    databaseCheck(database, guild, "moderator");
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
            if (((_b = guild.config.roles) === null || _b === void 0 ? void 0 : _b.muted) === role.id) {
                event.send('The specified role is already set as the mute role.');
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$set": { "config.roles.muted": role.id } }));
            event.send(`Set \`${role.name}\` as the mute role.`);
            if (option === "setauto") {
                setMutePermissions(event, role);
                event.send(`Automatically set permission overwrites for \`${role.name}\`.`);
            }
            break;
        }
        case "autoremove":
        case "remove": {
            if (!((_c = guild.config.roles) === null || _c === void 0 ? void 0 : _c.muted)) {
                event.send('No role is specified as the mute role.');
                return;
            }
            const role = event.guild.roles.cache.get(guild.config.roles.muted);
            if (!role) {
                event.send("The role that used to be the mute role was deleted or can't be found.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$set": { "config.roles.muted": null } }));
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
            if (!((_d = guild.config.roles) === null || _d === void 0 ? void 0 : _d.muted)) {
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
            if (!((_e = guild.config.roles) === null || _e === void 0 ? void 0 : _e.muted)) {
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
async function filterSettings(event, option, args, guild) {
    var _a, _b, _c, _d, _e, _f, _g;
    const database = event.client.database;
    if (!option) {
        const filter = (_a = guild === null || guild === void 0 ? void 0 : guild.config.filter) === null || _a === void 0 ? void 0 : _a.list;
        if (!filter || filter.length === 0) {
            event.send("There is no filtered words.");
            return;
        }
        let list = `**The following words are filtered: **\n`;
        filter.forEach((word) => {
            list += `\`${word}\` `;
        });
        event.send(list);
        return;
    }
    databaseCheck(database, guild, "filter");
    switch (option) {
        case "add": {
            const word = args;
            if (!word) {
                event.send("You need to specify a word.");
                return;
            }
            if ((_c = (_b = guild.config.filter) === null || _b === void 0 ? void 0 : _b.list) === null || _c === void 0 ? void 0 : _c.includes(word)) {
                event.send("'The specified word is already filtered.");
                break;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$push": { "config.filter.list": word } }));
            event.send(`Added \`${word}\` to the filter.`);
            break;
        }
        case "remove": {
            const word = args;
            if (!word) {
                event.send("You need to specify a word.");
                return;
            }
            if (!((_e = (_d = guild.config.filter) === null || _d === void 0 ? void 0 : _d.list) === null || _e === void 0 ? void 0 : _e.includes(word))) {
                event.send("The specified word isn't filtered.");
                break;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$pull": { "config.filter.list": word } }));
            event.send(`Removed \`${word}\` from the filter.`);
            break;
        }
        case "enable": {
            if ((_f = guild.config.filter) === null || _f === void 0 ? void 0 : _f.enabled) {
                event.send("The word filter is already enabled.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$set": { "config.filter.enabled": true } }));
            event.send("Enabled the word filter.");
        }
        case "disable": {
            if (!((_g = guild.config.filter) === null || _g === void 0 ? void 0 : _g.enabled)) {
                event.send("The word filter is already disabled.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$set": { "config.filter.enabled": false } }));
            event.send("Disabled the word filter.");
        }
    }
}
async function databaseCheck(database, guild, option) {
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
            else if (!guild.config.roles.moderator) {
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
function setMutePermissions(event, role) {
    var _a;
    const guild = event.guild;
    (_a = guild.roles.cache.get(role.id)) === null || _a === void 0 ? void 0 : _a.setPermissions(0);
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
    });
}
function removeMutePermissions(event, role) {
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
    });
}
//# sourceMappingURL=Config.js.map