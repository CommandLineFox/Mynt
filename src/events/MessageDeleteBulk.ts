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
            const first = messages.first();
            if (!first) {
                return;
            }

            const guild = first.guild;
            if (!guild) {
                return;
            }

            const database = client.database;
            const guildDb = await database.getGuild(guild.id);

            if (!guildDb?.config.logging?.enabled || !guildDb.config.logging.bulkDeletes) {
                return;
            }

            const log = guild.channels.cache.get(guildDb.config.logging.bulkDeletes) as TextChannel;
            if (!log) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.logging.bulkDeletes": "" } });
                return;
            }

            const audit = await guild.fetchAuditLogs({ type: "MESSAGE_BULK_DELETE", limit: 1 });
            const entry = audit.entries.first();
            if (!entry) {
                client.logs.push({ channel: log.id, content: `${messages.size} messages were deleted.` });
                return;
            }

            const date = entry.createdAt;
            const executor = entry.executor;

            const time = formatTime(date);
            const user = formatUser(executor!);
            const channel = formatChannel(first.channel as TextChannel);
            const contents = formatMessageDeleteBulk(messages);

            const line = `${time} <:channelDelete:829446173655171123> **${messages.size}** messages were deleted by ${user} from ${channel}:`;
            client.logs.push({ channel: log.id, content: line, attachment: { file: contents, name: "BulkDeleteLog.txt" } });
        } catch (error) {
            client.emit("error", (error as Error));
        }
    }
}

function formatChannel(channel: TextChannel): string {
    return `**${channel.name}** (<#${channel.id}>)`;
}

function formatMessageDeleteBulk(messages: Collection<Snowflake, Message>): string {
    let contents = "";
    const array = messages.toJSON().reverse();
    for (const message of array) {
        contents += `${formatTime(message.createdAt, true)} ${message.author.tag} (${message.author.id}): ${message.cleanContent}\n`;
    }

    return contents;
}
