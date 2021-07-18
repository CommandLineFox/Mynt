import Event from "@event/Event";
import { DMChannel, GuildChannel, TextChannel } from "discord.js";
import MyntClient from "~/MyntClient";
import { formatTime, formatUser } from "@utils/Format";

export default class ChannelDelete extends Event {
    public constructor() {
        super({ name: "channelDelete" });
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

            const audit = await guild.fetchAuditLogs({ type: "CHANNEL_DELETE", limit: 1 });
            const entry = audit.entries.first();
            if (!entry) {
                client.logs.push({ channel: log.id, content: `A channel has been deleted, **${channel.name}**` });
            }

            const date = entry?.createdAt;
            const executor = entry?.executor;

            const time = formatTime(date!);
            const user = formatUser(executor!);
            const tag = formatChannelDelete(channel);

            const line = `${time} <:channelDelete:829446173655171123> ${user} deleted a ${tag}`;
            client.logs.push({ channel: log.id, content: line });
        } catch (error) {
            client.emit("error", error);
        }
    }
}

function formatChannelDelete(channel: GuildChannel): string {
    if (channel.type === "category") {
        return `category **${channel.name}**`;
    }

    const parent = channel.parent ? `that was in the **${channel.parent.name}** category` : "";
    const tag = `channel **${channel.name}**`;
    return `${tag} ${parent}`;
}
