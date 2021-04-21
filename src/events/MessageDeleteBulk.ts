import Event from "@event/Event";
import MyntClient from "~/MyntClient";
import { Collection, Message, Snowflake, TextChannel } from "discord.js";
import { formatTime, formatUser } from "@utils/Format";

export default class MessageDeleteBulk extends Event {
    public constructor() {
        super({ name: "messageDeleteBulk" });
    }

    public async callback(client: MyntClient, messages: Collection<Snowflake, Message>): Promise<void> {
        try {
            const first = messages.array()[0];
            const guild = first.guild;
            if (!guild) {
                return;
            }

            const database = client.database;
            const guildDb = await database.getGuild(guild.id);

            if (!guildDb?.config.channels?.bulkDeletes) {
                return;
            }

            const log = guild.channels.cache.get(guildDb.config.channels.bulkDeletes) as TextChannel;
            if (!log) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.bulkDeletes": "" } });
                return;
            }

            const audit = await guild.fetchAuditLogs({ type: "MESSAGE_BULK_DELETE", limit: 1 });
            const entry = audit.entries.first();
            if (!entry) {
                log.send(`${messages.size} messages were deleted.`);
            }

            const date = entry?.createdAt;
            const executor = entry?.executor;

            const time = formatTime(date!);
            const user = formatUser(executor!);
            const channel = formatChannel(first.channel as TextChannel);
            const contents = formatMessageDeleteBulk(messages);

            const line = `${time} <:channelDelete:829446173655171123> **${messages.size}** messages were deleted by ${user} ${channel}:`;
            const attachment = { attachment: Buffer.from(contents, "utf8"), name: "BulkDeleteLog.txt" };
            log.send(line, { files: [attachment] });
        } catch (error) {
            client.emit("error", error);
        }
    }
}

function formatChannel(channel: TextChannel): string {
    return `in the **${channel.name}** (<#${channel.id}>) channel`;
}

function formatMessageDeleteBulk(messages: Collection<Snowflake, Message>): string {
    let contents = "";
    const array = messages.array().reverse();
    for (const message of array) {
        contents += `${formatTime(message.createdAt, true)} ${message.author.tag} (${message.author.id}): ${message.cleanContent}\n`;
    }

    return contents;
}
