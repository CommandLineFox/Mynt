import { User } from "discord.js";
import moment from "moment";

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
