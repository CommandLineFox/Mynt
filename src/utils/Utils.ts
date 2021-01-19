import { Guild, GuildMember } from "discord.js";
import MyntClient from "~/MyntClient";

export function splitArguments(argument: string, amount: number): string[] {
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

export async function getMember(argument: string, guild: Guild): Promise<GuildMember | undefined> {
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

export async function unmute(client: MyntClient, guildId: string, user: string): Promise<void> {
    const guild = await client.guilds.fetch(guildId, false);
    const member = await getMember(user, guild);
    
    if (!member) {
        return;
    }

    const guildDb = await client.database.getGuild(guildId);
    if (!guildDb || !guildDb.config.roles || !guildDb.config.roles.muted) {
        return;
    }

    const role = await guild.roles.fetch(guildDb.config.roles.muted);
    if (!role) {
        return;
    }

    await member.roles.remove(role, "Mute expired");
}

export async function unban(client: MyntClient, guildId: string, user: string): Promise<void> {
    const guild = await client.guilds.fetch(guildId, false);
    
    guild.members.unban(user, "Ban expired");
    return;
}
