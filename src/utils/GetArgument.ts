import { Guild, GuildMember } from "discord.js";

export async function getMember(argument: string, guild: Guild): Promise<GuildMember | undefined> {
    if (argument.length === 0) {
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

export function getDuration(argument: string): number | undefined {
    if (argument.length === 0) {
        return;
    }

    const regex = argument.toLowerCase().match(/^(?<amount>[0-9]+)(?<type>(?i)s|m|h|d|y?)$/);
    if (regex && regex.groups) {
        const amount = parseInt(regex.groups.amount);

        switch (regex.groups.type) {
            case "m": {
                return amount * 60 * 1000;
            }

            case "h": {
                return amount * 60 * 60 * 1000;
            }

            case "d": {
                return amount * 24 * 60 * 60 * 1000;
            }

            case "y": {
                return amount * 365 * 24 * 60 * 60 * 1000;
            }

            default: {
                return amount * 1000;
            }
        }
    }

    return;
}
