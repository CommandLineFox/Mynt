import Event from "@event/Event";
import { DMChannel, GuildChannel, TextChannel } from "discord.js";
import MyntClient from "~/MyntClient";
import { formatChannel, formatTime, formatUser } from "~/utils/Utils";

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
            if (!guildDb) {
                return;
            }

            if (!guildDb.config.channels || !guildDb.config.channels.guildChanges) {
                return;
            }

            const log = guild.channels.cache.get(guildDb.config.channels.guildChanges) as TextChannel;
            if (!log) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.guildChanges": "" } });
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
            const tag = formatChannel(channel);

            const line = `${time} ${user} created a new ${channel.type === "category" ? "category" : "channel"} ${tag}`;
            log.send(line);
        } catch (error) {
            client.emit("error", error);
        }
    }
}
