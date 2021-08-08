import MyntClient from "~/MyntClient";
import { getMember } from "@utils/GetArgument";

export async function mute(client: MyntClient, guildId: string, user: string): Promise<void> {
    const guild = await client.guilds.fetch(guildId);
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

    await member.roles.add(role, "Muted");
}

export async function unmute(client: MyntClient, guildId: string, user: string): Promise<void> {
    const guild = await client.guilds.fetch(guildId);
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
    const guild = await client.guilds.fetch(guildId);

    guild.members.unban(user, "Ban expired");
    return;
}
