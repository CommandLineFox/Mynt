import { GuildChannel, User } from "discord.js";
import moment from "moment";
import { LoggingType } from "@utils/Types";

export function sanitize(argument: string): string {
    const chars = ["|", "~", "`", "*", "_", "\\", "/"];
    let sanitized = "";

    let index = 0;
    while (index < argument.length) {
        if (chars.includes(argument[index])) {
            sanitized += "\\";
        }

        sanitized += argument[index];
        index++;
    }

    return sanitized;
}

export function formatTime(date: Date, file?: boolean, dynamic?: boolean): string {
    if (file) {
        const hours = `0${date.getUTCHours()}`.slice(-2);
        const minutes = `0${date.getUTCMinutes()}`.slice(-2);
        const seconds = `0${date.getUTCSeconds()}`.slice(-2);
        return `[${hours}:${minutes}:${seconds}]`;
    }

    if (dynamic === true) {
        const time = Math.floor(date.getTime() / 1000);
        return `[<t:${time}:T>]`;
    }

    const hours = `0${date.getUTCHours()}`.slice(-2);
    const minutes = `0${date.getUTCMinutes()}`.slice(-2);
    const seconds = `0${date.getUTCSeconds()}`.slice(-2);
    return `[\`${hours}:${minutes}:${seconds}\`]`;
}

export function formatDuration(date: Date, withoutSuffix?: boolean): string {
    return moment(date).fromNow(withoutSuffix);
}

export function formatUser(user: User): string {
    return `**${user.tag} (${user.id})**`;
}

export function formatChannel(channel: GuildChannel, includeParent: boolean, past: boolean): string {
    if (channel.type === "GUILD_CATEGORY") {
        return `category **${channel.name}**`;
    }

    const tag = `channel **${channel.name}**${past ? "" : ` (<#${channel.id}>)`}`;

    if (includeParent) {
        const parent = channel.parent ? `${past ? "that was " : ""}in **${channel.parent.name}**` : "";
        return `${tag} ${parent}`;
    }

    return tag;
}


export function formatLogging(type: string): LoggingType[] | "None" {
    switch (type.toLowerCase()) {
        case "edits":
        case "deletes":
        case "editlogs":
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
        case "rolechanges":
        case "role_changes": {
            return ["roleChanges"];
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
        case "join_logs":
        case "travel":
        case "travel_logs": {
            return ["travelLogs"];
        }

        case "messages": {
            return ["editLogs", "bulkDeletes"];
        }

        case "moderation": {
            return ["modActions", "commandUsed"];
        }

        case "changes": {
            return ["guildChanges", "roleChanges", "nameChanges"];
        }

        case "everything":
        case "all": {
            return ["editLogs", "bulkDeletes", "modActions", "commandUsed", "nameChanges", "roleChanges", "guildChanges", "channelChanges", "voiceChanges", "travelLogs"];
        }

        default: {
            return "None";
        }
    }
}
