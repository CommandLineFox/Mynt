import Command from "../../command/Command";
import { Administration } from "../../Groups";
import { Guild } from "../../models/Guild";
import { MessageEmbed } from "discord.js";
export default class Config extends Command {
    constructor() {
        super({ name: "Config", triggers: ["config", "cfg", "setup"], description: "Configures various settings for the guild", group: Administration });
    }
    async run(event) {
        const client = event.client;
        const database = client.database;
        let guild = await database.guilds.findOne({ id: event.guild.id });
        if (!guild) {
            const newguild = new Guild({ id: event.guild.id });
            await database.guilds.insertOne(newguild);
            guild = await database.guilds.findOne({ id: event.guild.id });
        }
        const [subcommand, option, args] = event.argument.split(/\s+/, 3);
        switch (subcommand.toLowerCase()) {
            case "prefix": {
                prefixSettings(event, option, args, guild);
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
            case "automod": {
                automodSettings(event, option, args, guild);
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
        }
    }
}
async function prefixSettings(event, option, _args, guild) {
    const client = event.client;
    const database = client.database;
    if (!option) {
        event.send(`The prefix is currently set to \`${(guild === null || guild === void 0 ? void 0 : guild.config.prefix) || client.config.prefix}\``);
        return;
    }
    switch (option.toLowerCase()) {
        case "reset": {
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild === null || guild === void 0 ? void 0 : guild.id }, { "$set": { "config.prefix": client.config.prefix } }));
            event.send(`The prefix has been set to \`${client.config.prefix}\``);
            break;
        }
        default: {
            if (option.length > 5) {
                event.send("The prefix can be up to 5 characters.");
                break;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild === null || guild === void 0 ? void 0 : guild.id }, { "$set": { "config.prefix": option } }));
            event.send(`The prefix has been set to \`${option}\``);
            break;
        }
    }
}
async function moderatorSettings(event, option, args, guild) {
    var _a, _b, _c, _d, _e;
    const database = event.client.database;
    databaseCheck(database, guild, "moderator");
    if (!option) {
        const mods = (_a = guild === null || guild === void 0 ? void 0 : guild.config.roles) === null || _a === void 0 ? void 0 : _a.moderator;
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
                database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$pull": { "config.roles.moderator": mod } });
            }
            else {
                list += `${role.name}\n`;
            }
        });
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
            if ((_c = (_b = guild.config.roles) === null || _b === void 0 ? void 0 : _b.moderator) === null || _c === void 0 ? void 0 : _c.includes(role.id)) {
                event.send("The specified role is already a moderator role.");
                break;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$push": { "config.roles.moderator": role.id } }));
            event.send(`Added \`${role.name}\` as a moderator role.`);
            break;
        }
        case "remove": {
            if (!((_e = (_d = guild.config.roles) === null || _d === void 0 ? void 0 : _d.moderator) === null || _e === void 0 ? void 0 : _e.includes(role.id))) {
                event.send("The specified role isn't a moderator role.");
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
    databaseCheck(database, guild, "roles");
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
            if (((_b = guild.config.roles) === null || _b === void 0 ? void 0 : _b.muted) === role.id) {
                event.send("The specified role is already set as the mute role.");
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
                event.send("No role is specified as the mute role.");
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
async function automodSettings(event, option, _args, guild) {
    var _a, _b, _c;
    const database = event.client.database;
    databaseCheck(database, guild, "automod");
    if (!option) {
        const automod = guild === null || guild === void 0 ? void 0 : guild.config.automod;
        if (!automod.enabled) {
            event.send("Automod is disabled.");
            return;
        }
        const embed = new MessageEmbed()
            .setTitle("Here's a list of automod features:")
            .addField("Word filter", `\`${((_a = automod === null || automod === void 0 ? void 0 : automod.filter) === null || _a === void 0 ? void 0 : _a.enabled) ? "Enabled" : "Disabled"}\``);
        event.send({ embed: embed });
        return;
    }
    switch (option.toLowerCase()) {
        case "enable": {
            if ((_b = guild.config.automod) === null || _b === void 0 ? void 0 : _b.enabled) {
                event.send("Automod is already enabled.");
                return;
            }
            database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod.enabled": true } });
            event.send("Succefully enabled automod features.");
            break;
        }
        case "disable": {
            if (!((_c = guild.config.automod) === null || _c === void 0 ? void 0 : _c.enabled)) {
                event.send("Automod is already disabled.");
                return;
            }
            database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod.enabled": false } });
            event.send("Succefully disabled automod features.");
            break;
        }
    }
}
async function filterSettings(event, option, args, guild) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const database = event.client.database;
    databaseCheck(database, guild, "automod");
    if (!option) {
        const filter = (_b = (_a = guild === null || guild === void 0 ? void 0 : guild.config.automod) === null || _a === void 0 ? void 0 : _a.filter) === null || _b === void 0 ? void 0 : _b.list;
        if (!filter || filter.length === 0) {
            event.send("There is no filtered words.");
            return;
        }
        const embed = new MessageEmbed()
            .setTitle("The following words are filtered:");
        let list = "";
        filter.forEach((word) => {
            list += `\`${word}\` `;
        });
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
            if ((_e = (_d = (_c = guild.config.automod) === null || _c === void 0 ? void 0 : _c.filter) === null || _d === void 0 ? void 0 : _d.list) === null || _e === void 0 ? void 0 : _e.includes(word)) {
                event.send("The specified word is already filtered.");
                break;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$push": { "config.automod.filter.list": word } }));
            event.send(`Added \`${word}\` to the filter.`);
            break;
        }
        case "remove": {
            const word = args;
            if (!word) {
                event.send("You need to specify a word.");
                return;
            }
            if (!((_h = (_g = (_f = guild.config.automod) === null || _f === void 0 ? void 0 : _f.filter) === null || _g === void 0 ? void 0 : _g.list) === null || _h === void 0 ? void 0 : _h.includes(word))) {
                event.send("The specified word isn't filtered.");
                break;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$pull": { "config.automod.filter.list": word } }));
            event.send(`Removed \`${word}\` from the filter.`);
            break;
        }
        case "enable": {
            if ((_k = (_j = guild.config.automod) === null || _j === void 0 ? void 0 : _j.filter) === null || _k === void 0 ? void 0 : _k.enabled) {
                event.send("The word filter is already enabled.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$set": { "config.automod.filter.enabled": true } }));
            event.send("Enabled the word filter.");
            break;
        }
        case "disable": {
            if (!((_m = (_l = guild.config.automod) === null || _l === void 0 ? void 0 : _l.filter) === null || _m === void 0 ? void 0 : _m.enabled)) {
                event.send("The word filter is already disabled.");
                return;
            }
            await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: event.guild.id }, { "$set": { "config.automod.filter.enabled": false } }));
            event.send("Disabled the word filter.");
            break;
        }
    }
}
async function overwriteSettings(event, option, args, guild) {
    var _a, _b;
    const database = event.client.database;
    databaseCheck(database, guild, "overwrite");
    if (!option) {
        const overwrites = guild === null || guild === void 0 ? void 0 : guild.config.overwrites;
        const embed = new MessageEmbed()
            .setTitle("These are the overwrites for this server:")
            .addField("Staff bypass", ` \`${overwrites.staffbypass ? "Enabled" : "Disabled"}\``);
        event.send({ embed: embed });
        return;
    }
    switch (option.toLowerCase()) {
        case "staffbypass": {
            const value = args;
            switch (value) {
                case "enable": {
                    if ((_a = guild.config.overwrites) === null || _a === void 0 ? void 0 : _a.staffbypass) {
                        event.send("Staff's ability to bypass automod is already enabled.");
                        return;
                    }
                    database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.overwrites.staffbypass": true } });
                    event.send("Enabled staff's ability to bypass automod.");
                    break;
                }
                case "disable": {
                    if (!((_b = guild.config.overwrites) === null || _b === void 0 ? void 0 : _b.staffbypass)) {
                        event.send("Staff's ability to bypass automod is already disabled.");
                        return;
                    }
                    database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$set": { "config.overwrites.staffbypass": false } });
                    event.send("Disabled staff's ability to bypass automod.");
                    break;
                }
            }
        }
    }
}
async function loggingSettings(event, option, _args, guild) {
    var _a;
    const database = event.client.database;
    databaseCheck(database, guild, "overwrite");
    if (!option) {
        const logging = guild === null || guild === void 0 ? void 0 : guild.config.logging;
        if (!logging.enabled) {
            event.send("Logging is disabled.");
        }
        if (((_a = logging.events) === null || _a === void 0 ? void 0 : _a.length) === 0) {
            event.send("Logging is enabled, but no events are set up.");
        }
        return;
    }
}
async function databaseCheck(database, guild, option) {
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
            else if (!guild.config.roles.moderator) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.moderator": [] } });
            }
            break;
        }
        case "logging": {
            if (!guild.config.logging) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.logging": { "enabled": false, "events": [] } } });
            }
            break;
        }
        case "automod": {
            if (!guild.config.automod) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.automod": { "filter": { "enabled": false, "list": [] } } } });
            }
            break;
        }
        case "overwrite": {
            if (!guild.config.overwrites) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.overwrites": { "staffBypass": true } } });
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