"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitArguments = exports.convertLogging = exports.displayData = exports.mutePermissions = exports.databaseCheck = void 0;
const discord_js_1 = require("discord.js");
async function databaseCheck(database, guild, option) {
    var _a;
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
            else if (!((_a = guild.config.roles) === null || _a === void 0 ? void 0 : _a.moderator)) {
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
                await database.guilds.updateOne({ id: guild.id }, {
                    "$set": {
                        "config.autoMod": {
                            "filter": {
                                "enabled": false,
                                "list": []
                            }
                        }
                    }
                });
            }
            break;
        }
        case "inviteblocker": {
            if (!guild.config.inviteBlocker) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.inviteblocker": false } });
            }
            break;
        }
    }
}
exports.databaseCheck = databaseCheck;
function mutePermissions(event, role, option) {
    var _a;
    const guild = event.guild;
    switch (option) {
        case "set": {
            (_a = guild.roles.cache.get(role.id)) === null || _a === void 0 ? void 0 : _a.setPermissions(0);
            guild.channels.cache.forEach(async (channel) => {
                if (channel.type === "category") {
                    await channel.updateOverwrite(role, {
                        "SEND_MESSAGES": false,
                        "ADD_REACTIONS": false,
                        "SPEAK": false
                    }, "Mute role setup");
                }
                if (channel.type === "text" && !channel.permissionsLocked) {
                    await channel.updateOverwrite(role, {
                        "SEND_MESSAGES": false,
                        "ADD_REACTIONS": false
                    }, "Mute role setup");
                }
                if (channel.type === "voice" && !channel.permissionsLocked) {
                    await channel.updateOverwrite(role, { "SPEAK": false }, "Mute role setup");
                }
            });
            break;
        }
        case "remove": {
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
            break;
        }
    }
}
exports.mutePermissions = mutePermissions;
async function displayData(event, guild, type, specific) {
    var _a, _b, _c, _d, _e, _f;
    const client = event.client;
    const database = client.database;
    if (!specific) {
        switch (type.toLowerCase()) {
            case "prefix": {
                return (_a = guild === null || guild === void 0 ? void 0 : guild.config.prefix) !== null && _a !== void 0 ? _a : client.config.prefix;
            }
            case "moderators": {
                const mods = (_b = guild === null || guild === void 0 ? void 0 : guild.config.roles) === null || _b === void 0 ? void 0 : _b.moderator;
                if (!mods || mods.length === 0) {
                    return "There is no moderator roles.";
                }
                let list = "";
                for (const mod of mods) {
                    const role = event.guild.roles.cache.get(mod);
                    if (!role) {
                        await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } }));
                    }
                    else {
                        list += `${role.name}\n`;
                    }
                }
                return list;
            }
            case "muterole": {
                if (!guild.config.roles) {
                    return "Not set up";
                }
                const id = guild === null || guild === void 0 ? void 0 : guild.config.roles.muted;
                if (!id) {
                    return "No mute role";
                }
                const role = event.guild.roles.cache.get(id);
                if (!role) {
                    await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } }));
                    return "No mute role";
                }
                return role.name;
            }
            case "automod": {
                return guild.config.automod === true ? "Enabled" : "Disabled";
            }
            case "filter": {
                if (!guild.config.filter) {
                    return "Not set up";
                }
                return guild.config.filter.enabled ? "Enabled" : "Disabled";
            }
            case "overwrites": {
                let list = "";
                list += `${guild.config.staffBypass === true ? "Enabled" : "Disabled"}\n`;
                return list;
            }
            case "logging": {
                return guild.config.logging === true ? "Enabled" : "Disabled";
            }
            case "inviteblocker": {
                return guild.config.inviteBlocker === true ? "Enabled" : "Disabled";
            }
        }
    }
    else {
        switch (type.toLowerCase()) {
            case "prefix": {
                await event.send(`The prefix is currently set to \`${(_c = guild === null || guild === void 0 ? void 0 : guild.config.prefix) !== null && _c !== void 0 ? _c : client.config.prefix}\``);
                break;
            }
            case "moderators": {
                const mods = (_d = guild === null || guild === void 0 ? void 0 : guild.config.roles) === null || _d === void 0 ? void 0 : _d.moderator;
                if (!mods || mods.length === 0) {
                    await event.send("There is no moderator roles.");
                    return;
                }
                const embed = new discord_js_1.MessageEmbed()
                    .setTitle("The following roles are moderator roles:")
                    .setColor("#61e096")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());
                let list = "";
                for (const mod of mods) {
                    const role = event.guild.roles.cache.get(mod);
                    if (!role) {
                        await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } }));
                    }
                    else {
                        list += `${role.name}\n`;
                    }
                }
                embed.setDescription(list);
                await event.send({ embed: embed });
                break;
            }
            case "muterole": {
                const id = (_e = guild === null || guild === void 0 ? void 0 : guild.config.roles) === null || _e === void 0 ? void 0 : _e.muted;
                if (!id) {
                    await event.send("There is no role set as the mute role.");
                    return;
                }
                const role = event.guild.roles.cache.get(id);
                if (!role) {
                    await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } }));
                    await event.send("The role that used to be the mute role was deleted or can't be found.");
                    return;
                }
                await event.send(`\`${role.name}\` is set as the mute role.`);
                break;
            }
            case "automod": {
                const automod = guild === null || guild === void 0 ? void 0 : guild.config.automod;
                if (automod !== true) {
                    await event.send("Automod is disabled.");
                    return;
                }
                const filter = guild.config.filter;
                const inviteBlocker = guild.config.inviteBlocker;
                const embed = new discord_js_1.MessageEmbed()
                    .setTitle("Here's a list of automod features:")
                    .addField("Word filter", `\`${(filter && filter.enabled) ? "Enabled" : "Disabled"}\``, true)
                    .addField("Ad blocker", `\`${(inviteBlocker === true) ? "Enabled" : "Disabled"}\``, true)
                    .setColor("#61e096")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());
                await event.send({ embed: embed });
                break;
            }
            case "filter": {
                if (!guild.config.filter || !guild.config.filter.enabled) {
                    await event.send("The filter is disabled.");
                    return;
                }
                const filter = (_f = guild === null || guild === void 0 ? void 0 : guild.config.filter) === null || _f === void 0 ? void 0 : _f.list;
                if (!filter || filter.length === 0) {
                    await event.send("There is no filtered words.");
                    return;
                }
                const embed = new discord_js_1.MessageEmbed()
                    .setTitle("The following words are filtered:")
                    .setColor("#61e096")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());
                let list = "";
                filter.forEach((word) => {
                    list += `\`${word}\` `;
                });
                embed.setDescription(list);
                await event.send({ embed: embed });
                break;
            }
            case "overwrites": {
                const embed = new discord_js_1.MessageEmbed()
                    .setTitle("These are the overwrites for this server:")
                    .addField("Staff bypass", `${guild.config.staffBypass === true ? "Enabled" : "Disabled"}`, true)
                    .setColor("#61e096")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());
                await event.send({ embed: embed });
                break;
            }
            case "logging": {
                if (!guild.config.channels) {
                    await event.send("Logging isn't set up.");
                    return;
                }
                const embed = new discord_js_1.MessageEmbed()
                    .setTitle("This is the list of logging modules for this server:")
                    .addField("Edits / Deletions", await checkLoggingChannels(event, database, guild, "editLogs"), true)
                    .addField("Bulk deletes", await checkLoggingChannels(event, database, guild, "bulkDeletes"), true)
                    .addField("Mod actions", await checkLoggingChannels(event, database, guild, "modActions"), true)
                    .addField("Command used", await checkLoggingChannels(event, database, guild, "commandUsed"), true)
                    .addField("Name changes", await checkLoggingChannels(event, database, guild, "nameChanges"), true)
                    .addField("Role updates", await checkLoggingChannels(event, database, guild, "roleUpdates"), true)
                    .addField("Guild changes", await checkLoggingChannels(event, database, guild, "guildChanges"), true)
                    .addField("Channel changes", await checkLoggingChannels(event, database, guild, "channelChanges"), true)
                    .addField("Voice changes", await checkLoggingChannels(event, database, guild, "voiceChanges"), true)
                    .addField("Joins", await checkLoggingChannels(event, database, guild, "joinLogs"), true)
                    .setColor("#61e096")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());
                await event.send({ embed: embed });
                break;
            }
            case "inviteblocker": {
                await event.send(`${guild.config.inviteBlocker === true ? "The invite blocker is enabled." : "The invite blocker is disabled."}`);
                break;
            }
        }
    }
    return;
}
exports.displayData = displayData;
function convertLogging(type) {
    switch (type.toLowerCase()) {
        case "edits":
        case "deletes":
        case "edit_logs": {
            return ["editLogs"];
        }
        case "bulks":
        case "bulkdeletes":
        case "bulk_delete_logs": {
            return ["bulkDeletes"];
        }
        case "modactions":
        case "mod_actions": {
            return ["modActions"];
        }
        case "usage":
        case "commands":
        case "command_used": {
            return ["commandUsed"];
        }
        case "names":
        case "nicknames":
        case "namechanges":
        case "name_changes": {
            return ["nameChanges"];
        }
        case "roles":
        case "roleupdates":
        case "role_updates": {
            return ["roleUpdates"];
        }
        case "guild":
        case "guildchanges":
        case "guild_changes": {
            return ["guildChanges"];
        }
        case "channels":
        case "channelchanges":
        case "channel_changes": {
            return ["channelChanges"];
        }
        case "voice":
        case "voice_changes": {
            return ["voiceChanges"];
        }
        case "joins":
        case "join_logs": {
            return ["joinLogs"];
        }
        case "messages": {
            return ["editLogs", "bulkDeletes"];
        }
        case "moderation": {
            return ["modActions", "commandUsed"];
        }
        case "updates": {
            return ["guildChanges", "roleUpdates", "nameChanges"];
        }
        case "everything":
        case "all": {
            return ["editLogs", "bulkDeletes", "modActions", "commandUsed", "nameChanges", "roleUpdates", "guildChanges", "channelChanges", "voiceChanges", "joinLogs"];
        }
        default: {
            return "None";
        }
    }
}
exports.convertLogging = convertLogging;
async function checkLoggingChannels(event, database, guild, type) {
    if (!guild.config.channels || !guild.config.channels[type]) {
        return "Not set";
    }
    const channel = event.guild.channels.cache.get(guild.config.channels[type]);
    if (!channel) {
        await database.guilds.updateOne({ id: guild.id }, { "$unset": { [`config.channels.${type}`]: "" } });
        return "Not set";
    }
    return `<#${channel.id}>`;
}
function splitArguments(argument, amount) {
    const args = [];
    let element = "";
    let index = 0;
    while (index < argument.length) {
        if (args.length < amount - 1) {
            if (argument[index].match(/\s/)) {
                if (element.trim().length > 0) {
                    args.push(element.trim());
                }
                element = "";
            }
        }
        element += argument[index];
        index++;
    }
    if (element.trim().length > 0) {
        args.push(element.trim());
    }
    return args;
}
exports.splitArguments = splitArguments;
//# sourceMappingURL=Utils.js.map