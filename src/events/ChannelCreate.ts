import Event from "@event/Event";
import { DMChannel, GuildChannel, TextChannel } from "discord.js";
import MyntClient from "~/MyntClient";
import { formatChannel, formatTime, formatUser } from "@utils/Format";

export default class ChannelCreate extends Event {
    public constructor() {
        super({ name: "channelCreate" });
    }

    public async callback(client: MyntClient, channel: DMChannel | GuildChannel): Promise<void> {
        try {
            if (channel.partial || channel.type === "DM") {
                return;
            }

            const guild = channel.guild;
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

            const audit = await guild.fetchAuditLogs({ type: "CHANNEL_CREATE", limit: 1 });
            const entry = audit.entries.first();
            if (!entry) {
                client.logs.push({ channel: log.id, content: `A new channel has been created, <#${channel.id}>` });
                return;
            }

            const date = entry.createdAt;
            const executor = entry.executor;

            const time = formatTime(date);
            const user = formatUser(executor!);
            const tag = formatChannel(channel, true, false);

            const line = `${time} <:channelCreate:829444455417249862> ${user} created a ${tag}`;
            client.logs.push({ channel: log.id, content: line });
        } catch (error) {
            client.emit("error", (error as Error));
        }
    }
}
