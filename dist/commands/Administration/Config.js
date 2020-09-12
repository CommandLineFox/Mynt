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
        var _a;
        const client = event.client;
        const database = client.database;
        let guild = await database.guilds.findOne({ id: event.guild.id });
        if (!guild) {
            const newguild = new Guild_1.Guild({ id: event.guild.id });
            await database.guilds.insertOne(newguild);
            guild = await database.guilds.findOne({ id: event.guild.id });
        }
        const args = event.argument.split(' ');
        const subcommand = (_a = args.shift()) === null || _a === void 0 ? void 0 : _a.trim();
        switch (subcommand) {
            case "prefix": {
                prefixsettings(event, args, guild);
                break;
            }
            case "moderator":
            case "mods":
            case "moderators":
            case "staff": {
                moderatorsettings(event, args, guild);
                break;
            }
        }
    }
}
exports.default = Config;
function prefixsettings(event, args, guild) {
    var _a;
    const client = event.client;
    const database = client.database;
    const prefix = (_a = args.shift()) === null || _a === void 0 ? void 0 : _a.trim();
    if (!prefix) {
        event.send(`The prefix is currently set to \`${(guild === null || guild === void 0 ? void 0 : guild.config.prefix) || client.config.prefix}\``);
        return;
    }
    if (prefix.length > 5) {
        event.send("The prefix can be up to 5 characters.");
        return;
    }
    if (prefix.toLowerCase() === "reset") {
        database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild === null || guild === void 0 ? void 0 : guild.id }, { "$set": { "config.prefix": client.config.prefix } });
        event.send(`The prefix has been set to \`${client.config.prefix}\``);
        return;
    }
    database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild === null || guild === void 0 ? void 0 : guild.id }, { "$set": { "config.prefix": prefix } });
    event.send(`The prefix has been set to \`${prefix}\``);
}
function moderatorsettings(event, args, guild) {
    var _a, _b, _c;
    const database = event.client.database;
    const option = (_a = args.shift()) === null || _a === void 0 ? void 0 : _a.trim();
    if (!option) {
        const mods = (_b = guild === null || guild === void 0 ? void 0 : guild.config.roles) === null || _b === void 0 ? void 0 : _b.moderator;
        if (!mods) {
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
    const staff = (_c = args.shift()) === null || _c === void 0 ? void 0 : _c.trim();
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
            database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$push": { "config.roles.moderator": role.id } });
            event.send(`Added \`${role.name}\` as a moderator role.`);
            break;
        }
        case "remove": {
            database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$pull": { "config.roles.moderator": role.id } });
            event.send(`\`${role.name}\` is no longer a moderator role.`);
            break;
        }
    }
}
function databaseCheck(database, guild, option) {
    switch (option) {
        case "roles": {
            if (!guild.config.roles) {
                database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles": {} } });
            }
            break;
        }
        case "channels": {
            if (!guild.config.channels) {
                database.guilds.updateOne({ id: guild.id }, { "$set": { "config.channels": {} } });
            }
            break;
        }
        case "moderator": {
            if (!guild.config.roles) {
                database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles": {} } });
            }
            if (!guild.config.roles.moderator) {
                database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.moderator": [] } });
            }
            break;
        }
    }
}
//# sourceMappingURL=Config.js.map