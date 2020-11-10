"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLogging = exports.displayData = exports.mutePermissions = exports.databaseCheck = void 0;
const discord_js_1 = require("discord.js");
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
    var _a, _b, _c, _d;
    const client = event.client;
    const database = client.database;
    if (!specific) {
        switch (type.toLowerCase()) {
            case "prefix": {
                return (guild === null || guild === void 0 ? void 0 : guild.config.prefix) || client.config.prefix;
            }
            case "moderators": {
                const mods = (_a = guild === null || guild === void 0 ? void 0 : guild.config.roles) === null || _a === void 0 ? void 0 : _a.moderator;
                if (!mods || mods.length === 0) {
                    return "There is no moderator roles.";
                }
                let list = "";
                mods.forEach(async (mod) => {
                    const role = event.guild.roles.cache.get(mod);
                    if (!role) {
                        await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } }));
                    }
                    else {
                        list += `${role.name}\n`;
                    }
                });
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
            case "inviteBlocker": {
                return guild.config.inviteBlocker === true ? "Enabled" : "Disabled";
            }
        }
    }
    else {
        switch (type.toLowerCase()) {
            case "prefix": {
                event.send(`The prefix is currently set to \`${(guild === null || guild === void 0 ? void 0 : guild.config.prefix) || client.config.prefix}\``);
                break;
            }
            case "moderators": {
                const mods = (_b = guild === null || guild === void 0 ? void 0 : guild.config.roles) === null || _b === void 0 ? void 0 : _b.moderator;
                if (!mods || mods.length === 0) {
                    event.send("There is no moderator roles.");
                    return;
                }
                const embed = new discord_js_1.MessageEmbed()
                    .setTitle("The following roles are moderator roles:")
                    .setColor("#61e096")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());
                let list = "";
                mods.forEach(async (mod) => {
                    const role = event.guild.roles.cache.get(mod);
                    if (!role) {
                        await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } }));
                    }
                    else {
                        list += `${role.name}\n`;
                    }
                });
                embed.setDescription(list);
                event.send({ embed: embed });
                break;
            }
            case "muterole": {
                const id = (_c = guild === null || guild === void 0 ? void 0 : guild.config.roles) === null || _c === void 0 ? void 0 : _c.muted;
                if (!id) {
                    event.send("There is no role set as the mute role.");
                    return;
                }
                const role = event.guild.roles.cache.get(id);
                if (!role) {
                    await (database === null || database === void 0 ? void 0 : database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } }));
                    event.send("The role that used to be the mute role was deleted or can't be found.");
                    return;
                }
                event.send(`\`${role.name}\` is set as the mute role.`);
                break;
            }
            case "automod": {
                const automod = guild === null || guild === void 0 ? void 0 : guild.config.automod;
                if (automod !== true) {
                    event.send("Automod is disabled.");
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
                event.send({ embed: embed });
                break;
            }
            case "filter": {
                if (!guild.config.filter || !guild.config.filter.enabled) {
                    event.send("The filter is disabled.");
                    return;
                }
                const filter = (_d = guild === null || guild === void 0 ? void 0 : guild.config.filter) === null || _d === void 0 ? void 0 : _d.list;
                if (!filter || filter.length === 0) {
                    event.send("There is no filtered words.");
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
                event.send({ embed: embed });
                break;
            }
            case "overwrites": {
                const embed = new discord_js_1.MessageEmbed()
                    .setTitle("These are the overwrites for this server:")
                    .addField("Staff bypass", `${guild.config.staffBypass === true ? "Enabled" : "Disabled"}`, true)
                    .setColor("#61e096")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());
                event.send({ embed: embed });
                break;
            }
            case "logging": {
                if (!guild.config.channels) {
                    event.send("Logging isn't set up.");
                    return;
                }
                const embed = new discord_js_1.MessageEmbed()
                    .setTitle("This is the list of logging modules for this server:")
                    .addField("Edits / Deletions", await checkLoggingChannels(event, database, guild, "editLogs"))
                    .addField("Bulk deletes", await checkLoggingChannels(event, database, guild, "editLogs"))
                    .addField("Mod actions", await checkLoggingChannels(event, database, guild, "editLogs"))
                    .addField("Command used", await checkLoggingChannels(event, database, guild, "editLogs"))
                    .addField("Name changes", await checkLoggingChannels(event, database, guild, "editLogs"))
                    .addField("Role updates", await checkLoggingChannels(event, database, guild, "editLogs"))
                    .addField("Guild changes", await checkLoggingChannels(event, database, guild, "editLogs"))
                    .addField("Channel changes", await checkLoggingChannels(event, database, guild, "editLogs"))
                    .addField("Voice changes", await checkLoggingChannels(event, database, guild, "editLogs"))
                    .addField("Joins", await checkLoggingChannels(event, database, guild, "editLogs"))
                    .setColor("#61e096")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());
                event.send({ embed: embed });
                break;
            }
            case "inviteBlocker": {
                event.send(`${guild.config.inviteBlocker === true ? "The invite blocker is enabled." : "The invite blocker is disabled."}`);
                break;
            }
        }
    }
    return;
}
exports.displayData = displayData;
function convertLogging(type) {
    switch (type) {
        case "edits":
        case "deletes":
        case "edit_logs": {
            return ["editLogs"];
        }
        case "bulks":
        case "bulkDeletess":
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
    return `<#${channel.id}`;
}
//# sourceMappingURL=Utils.js.map