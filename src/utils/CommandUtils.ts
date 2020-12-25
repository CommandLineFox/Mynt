import CommandEvent from "@command/CommandEvent";
import { Guild } from "@models/Guild";
import { Database } from "@database/Database";
import { DatabaseCheckOption, DisplayData, LoggingType, MutePermissionOption } from "@utils/Types";
import { MessageEmbed, Role, Guild as GuildObject, GuildMember } from "discord.js";

export async function databaseCheck(database: Database, guild: Guild, option: DatabaseCheckOption): Promise<void> {
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
            } else if (!guild.config.roles?.moderator) {
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

export function mutePermissions(event: CommandEvent, role: Role, option: MutePermissionOption): void {
    const guild = event.guild;

    switch (option) {
        case "set": {
            guild.roles.cache.get(role.id)?.setPermissions(0);

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

export async function displayData(event: CommandEvent, guild: Guild, type: DisplayData, specific?: boolean): Promise<any> {
    const client = event.client;
    const database = client.database;
    if (!specific) {
        switch (type.toLowerCase()) {
            case "prefix": {
                return guild?.config.prefix ?? client.config.prefix;
            }

            case "moderators": {
                const mods = guild?.config.roles?.moderator;
                if (!mods || mods.length === 0) {
                    return "There is no moderator roles.";
                }

                let list = "";
                for (const mod of mods) {
                    const role = event.guild.roles.cache.get(mod);
                    if (!role) {
                        await database?.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } });
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

            case "inviteblocker": {
                return guild.config.inviteBlocker === true ? "Enabled" : "Disabled";
            }
        }
    } else {
        switch (type.toLowerCase()) {
            case "prefix": {
                await event.send(`The prefix is currently set to \`${guild?.config.prefix ?? client.config.prefix}\``);
                break;
            }

            case "moderators": {
                const mods = guild?.config.roles?.moderator;
                if (!mods || mods.length === 0) {
                    await event.send("There is no moderator roles.");
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
                        await database?.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } });
                    } else {
                        list += `${role.name}\n`;
                    }
                }

                embed.setDescription(list);
                await event.send({ embed: embed });
                break;
            }

            case "muterole": {
                const id = guild?.config.roles?.muted;
                if (!id) {
                    await event.send("There is no role set as the mute role.");
                    return;
                }

                const role = event.guild.roles.cache.get(id);
                if (!role) {
                    await database?.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.muted": "" } });
                    await event.send("The role that used to be the mute role was deleted or can't be found.");
                    return;
                }

                await event.send(`\`${role.name}\` is set as the mute role.`);
                break;
            }

            case "automod": {
                const automod = guild?.config.automod;
                if (automod !== true) {
                    await event.send("Automod is disabled.");
                    return;
                }

                const filter = guild.config.filter;
                const inviteBlocker = guild.config.inviteBlocker;
                const embed = new MessageEmbed()
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

                const filter = guild?.config.filter?.list;
                if (!filter || filter.length === 0) {
                    await event.send("There is no filtered words.");
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
                await event.send({ embed: embed });
                break;
            }

            case "overwrites": {
                const embed = new MessageEmbed()
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

                const embed = new MessageEmbed()
                    .setTitle("This is the list of logging modules for this server:")
                    .addField("Edits / Deletions", await checkLoggingChannels(event, database!, guild, "editLogs"), true)
                    .addField("Bulk deletes", await checkLoggingChannels(event, database!, guild, "bulkDeletes"), true)
                    .addField("Mod actions", await checkLoggingChannels(event, database!, guild, "modActions"), true)
                    .addField("Command used", await checkLoggingChannels(event, database!, guild, "commandUsed"), true)
                    .addField("Name changes", await checkLoggingChannels(event, database!, guild, "nameChanges"), true)
                    .addField("Role updates", await checkLoggingChannels(event, database!, guild, "roleUpdates"), true)
                    .addField("Guild changes", await checkLoggingChannels(event, database!, guild, "guildChanges"), true)
                    .addField("Channel changes", await checkLoggingChannels(event, database!, guild, "channelChanges"), true)
                    .addField("Voice changes", await checkLoggingChannels(event, database!, guild, "voiceChanges"), true)
                    .addField("Joins", await checkLoggingChannels(event, database!, guild, "joinLogs"), true)
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

export function convertLogging(type: string): LoggingType[] | "None" {
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

async function checkLoggingChannels(event: CommandEvent, database: Database, guild: Guild, type: LoggingType) {
    if (!guild.config.channels || !guild.config.channels[type]) {
        return "Not set";
    }

    const channel = event.guild.channels.cache.get(guild.config.channels[type]!);
    if (!channel) {
        await database.guilds.updateOne({ id: guild.id }, { "$unset": { [`config.channels.${type}`]: "" } });
        return "Not set";
    }

    return `<#${channel.id}>`;
}

export async function getMember(argument: string, guild: GuildObject): Promise<GuildMember | undefined> {
    if (!argument) {
        return;
    }

    const regex = argument.match(/^((?<username>.+?)#(?<discrim>\d{4})|<?@?!?(?<id>\d{16,18})>?)$/);
    if (regex && regex.groups) {
        if (regex.groups.username) {
            return (await guild.members.fetch({ query: regex.groups.username, limit: 1 })).first();
        } else if (regex.groups.id) {
            return guild.members.fetch(regex.groups.id);
        }
    }

    return (await guild.members.fetch({ query: argument, limit: 1 })).first();
}
