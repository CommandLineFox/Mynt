import Event from "@event/Event";
import { DMChannel, GuildChannel, TextChannel } from "discord.js";
import MyntClient from "~/MyntClient";
import { formatChannel, formatTime, formatUser } from "@utils/Format";

export default class ChannelUpdate extends Event {
    public constructor() {
        super({ name: "channelUpdate" });
    }

    public async callback(client: MyntClient, oldChannel: DMChannel | GuildChannel, newChannel: DMChannel | GuildChannel): Promise<void> {
        try {
            if (oldChannel.type === "dm" || newChannel.type === "dm") {
                return;
            }

            console.log("Henlo some shit changed");
            const guild = oldChannel.guild;
            const database = client.database;
            const guildDb = await database.getGuild(guild.id);
            if (!guildDb?.config.logging?.enabled || !guildDb.config.logging.channelChanges) {
                return;
            }

            const log = guild.channels.cache.get(guildDb.config.logging.channelChanges) as TextChannel;
            if (!log) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.logging.channelChanges": "" } });
                return;
            }
            const audit = await guild.fetchAuditLogs({ type: "CHANNEL_UPDATE", limit: 1 });
            const entry = audit.entries.first();
            if (!entry) {
                client.logs.push({ channel: log.id, content: `A new channel has been updated, <#${oldChannel.id}>` });
            }

            const date = entry?.createdAt;
            const executor = entry?.executor;

            const time = formatTime(date!);
            const user = formatUser(executor!);
            const channel = formatChannel(oldChannel, false, false);
            const changes = formatChannelUpdate(oldChannel, newChannel);

            const line = `${time} <:channelUpdate:829444517152423936> ${user} made the following changes to ${channel}:\n${changes}`;
            client.logs.push({ channel: log.id, content: line });
        } catch (error) {
            client.emit("error", error);
        }
    }
}

function formatChannelUpdate(channel: GuildChannel, secondChannel: GuildChannel): string {
    if (channel.type === "category") {
        return `category **${secondChannel.name}**`;
    }

    const parent = channel.parent ? `in the **${channel.parent.name}** category` : "";
    const tag = channel.type === "text" ? `channel **${channel.name}** (<#${channel.id}>)` : `channel **${channel.name}**`;
    return `${tag} ${parent}`;
}
