import CommandEvent from "@command/CommandEvent";
import { Guild } from "@models/Guild";
import { Database } from "@utils/Database";
import { DatabaseCheckOption, DisplayData, LoggingType, MutePermissionOption } from "@utils/Types";
import { MessageEmbed, Role } from "discord.js";

export async function databaseCheck(database: Database, guild: Guild, option: DatabaseCheckOption) {
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
            if (!guild.config.adBlocker) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.inviteblocker": false } });
            }
            break;
        }
    }
}

export function mutePermissions(event: CommandEvent, role: Role, option: MutePermissionOption) {
    const guild = event.guild;

    switch (option) {
        case "set": {
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
            })
            break;
        }
    }
}

export async function displayData(event: CommandEvent, guild: Guild, type: DisplayData, specific?: boolean) {
    const client = event.client;
    const database = client.database;
    if (!specific) {
        switch (type.toLowerCase()) {
            case "prefix": {
                return guild?.config.prefix || client.config.prefix;
            }

            case "moderators": {
                const mods = guild?.config.roles?.moderator;
                if (!mods || mods.length === 0) {
                    return "There is no moderator roles.";
                }

                let list = "";
                mods.forEach(async (mod) => {
                    const role = event.guild.roles.cache.get(mod);
                    if (!role) {
                        await database?.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } });
                    }
                    else {
                        list += `${role.name}\n`;
                    }
                })

                return list;
            }

            case "muterole": {
                if (!guild.config.roles) {
                    return "Not set up";
                }

                const id = guild?.config.roles.muted;
                if (!id) {
                    return "No mute role";
                }

                const role = event.guild.roles.cache.get(id);
                if (!role) {
                    await database?.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } });
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

            case "adBlocker": {
                return guild.config.adBlocker === true ? "Enabled" : "Disabled";
            }
        }
    }
    else {
        switch (type.toLowerCase()) {
            case "prefix": {
                event.send(`The prefix is currently set to \`${guild?.config.prefix || client.config.prefix}\``);
                break;
            }

            case "moderators": {
                const mods = guild?.config.roles?.moderator;
                if (!mods || mods.length === 0) {
                    event.send("There is no moderator roles.");
                    return;
                }

                const embed = new MessageEmbed()
                    .setTitle("The following roles are moderator roles:");

                let list = "";
                mods.forEach(async (mod) => {
                    const role = event.guild.roles.cache.get(mod);
                    if (!role) {
                        await database?.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } });
                    }
                    else {
                        list += `${role.name}\n`;
                    }
                })

                embed.setDescription(list);
                event.send({ embed: embed });
                break;
            }

            case "muterole": {
                const id = guild?.config.roles?.muted;
                if (!id) {
                    event.send("There is no role set as the mute role.");
                    return;
                }

                const role = event.guild.roles.cache.get(id);
                if (!role) {
                    await database?.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } });
                    event.send("The role that used to be the mute role was deleted or can't be found.");
                    return;
                }

                event.send(`\`${role.name}\` is set as the mute role.`);
                break;
            }

            case "automod": {
                const automod = guild?.config.automod;
                if (automod === false) {
                    event.send("Automod is disabled.");
                    return;
                }

                const filter = guild.config.filter;
                const adBlocker = guild.config.adBlocker;
                const embed = new MessageEmbed()
                    .setTitle("Here's a list of automod features:")
                    .addField("Word filter", `\`${(filter && filter.enabled) ? "Enabled" : "Disabled"}\``, true)
                    .addField("Ad blocker", `\`${(adBlocker === true) ? "Enabled" : "Disabled"}\``, true);

                event.send({ embed: embed });
                break;
            }

            case "filter": {
                if (!guild.config.filter || !guild.config.filter.enabled) {
                    event.send("The filter is disabled.");
                    return;
                }

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
                break;
            }

            case "overwrites": {
                const embed = new MessageEmbed()
                    .setTitle("These are the overwrites for this server:")
                    .addField("Staff bypass", `${guild.config.staffBypass === true ? "Enabled" : "Disabled"}`, true);

                event.send({ embed: embed });
                break;
            }

            case "logging": {
                if (!guild.config.channels) {
                    event.send("Logging isn't set up.");
                    return;
                }

                const embed = new MessageEmbed()
                    .setTitle("This is the list of logging modules for this server:")
                    .addField("Edits / Deletions", await checkLoggingChannels(event, database!, guild, "editLogs"))
                    .addField("Bulk deletes", await checkLoggingChannels(event, database!, guild, "editLogs"))
                    .addField("Mod actions", await checkLoggingChannels(event, database!, guild, "editLogs"))
                    .addField("Command used", await checkLoggingChannels(event, database!, guild, "editLogs"))
                    .addField("Name changes", await checkLoggingChannels(event, database!, guild, "editLogs"))
                    .addField("Role updates", await checkLoggingChannels(event, database!, guild, "editLogs"))
                    .addField("Guild changes", await checkLoggingChannels(event, database!, guild, "editLogs"))
                    .addField("Channel changes", await checkLoggingChannels(event, database!, guild, "editLogs"))
                    .addField("Voice changes", await checkLoggingChannels(event, database!, guild, "editLogs"))
                    .addField("Joins", await checkLoggingChannels(event, database!, guild, "editLogs"))

                event.send({ embed: embed });
                break;
            }

            case "adBlocker": {
                event.send(`${guild.config.adBlocker === true ? "The invite blocker is enabled." : "The invite blocker is disabled."}`);
                break;
            }
        }
    }
    return;
}

export function convertLogging(type: string) {
    switch (type) {
        case "edits":
        case "deletes":
        case "edit_logs": {
            return "editLogs";
        }

        case "bulks":
        case "bulkdeletes":
        case "bulk_delete_logs": {
            return "bulkDelete";
        }

        case "modactions":
        case "mod_actions": {
            return "modActions";
        }

        case "usage":
        case "commands":
        case "command_used": {
            return "commandUsed";
        }

        case "names":
        case "nicknames":
        case "namechanges":
        case "name_changes": {
            return "nameChanges";
        }

        case "roles":
        case "roleupdates":
        case "role_updates": {
            return "roleUpdates";
        }

        case "guild":
        case "guildchanges":
        case "guild_changes": {
            return "guildChanges";
        }

        case "channels":
        case "channelchanges":
        case "channel_changes": {
            return "channelChanges";
        }

        case "voice":
        case "voice_changes": {
            return "voiceChanges";
        }

        case "joins":
        case "join_logs": {
            return "joinLogs";
        }
        default: {
            return "None";
        }
    }
}

async function checkLoggingChannels(event: CommandEvent, database: Database, guild: Guild, type: LoggingType) {
    if (!guild.config.channels || !guild.config.channels[type]) {
        return "Not set";
    }

    const channel = event.guild.channels.cache.get(guild.config.channels[type]!);
    if (!channel) {
        await database.guilds.updateOne({ id: guild.id }, { "$unset": { [`config.channels.${type}`]: "" } });
        return "Not set";
    }
    
    return `<#${channel.id}`;
}
