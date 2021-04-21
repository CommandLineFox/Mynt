import Event from "@event/Event";
import { DMChannel, GuildChannel, TextChannel } from "discord.js";
import MyntClient from "~/MyntClient";
import { formatTime, formatUser } from "@utils/Format";

export default class ChannelCreate extends Event {
    public constructor() {
        super({ name: "channelCreate" });
    }

    public async callback(client: MyntClient, channel: DMChannel | GuildChannel): Promise<void> {
        try {
            if (channel.type === "dm") {
                return;
            }

            const guild = channel.guild;
            const database = client.database;
            const guildDb = await database.getGuild(guild.id);
            if (!guildDb?.config.channels?.channelChanges) {
                return;
            }

            const log = guild.channels.cache.get(guildDb.config.channels.channelChanges) as TextChannel;
            if (!log) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.channelChanges": "" } });
                return;
            }

            const audit = await guild.fetchAuditLogs({ type: "CHANNEL_CREATE", limit: 1 });
            const entry = audit.entries.first();
            if (!entry) {
                log.send(`A new channel has been created, <£${channel.id}>.`);
            }

            const date = entry?.createdAt;
            const executor = entry?.executor;

            const time = formatTime(date!);
            const user = formatUser(executor!);
            const tag = formatChannelCreate(channel);

            const line = `${time} <:channelCreate:829444455417249862> ${user} created a new ${tag}`;
            log.send(line);
        } catch (error) {
            client.emit("error", error);
        }
    }
}

function formatChannelCreate(channel: GuildChannel): string {
    if (channel.type === "category") {
        return `category **${channel.name}**`;
    }

    const parent = channel.parent ? `in the **${channel.parent.name}** category` : "";
    const tag = channel.type === "text" ? `channel **${channel.name}** (<#${channel.id}>)` : `channel **${channel.name}**`;
    return `${tag} ${parent}`;
}
