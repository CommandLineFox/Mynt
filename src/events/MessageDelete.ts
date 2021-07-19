import Event from "@event/Event";
import MyntClient from "~/MyntClient";
import { Message, TextChannel } from "discord.js";
import { formatDuration, formatTime, formatUser, sanitize } from "@utils/Format";

export default class MessageDelete extends Event {
    public constructor() {
        super({ name: "messageDelete" });
    }

    public async callback(client: MyntClient, message: Message): Promise<void> {
        try {
            if (message.author.bot) {
                return;
            }

            if (message.content.length == 0) {
                return;
            }

            const guild = message.guild;
            if (!guild) {
                return;
            }

            const database = client.database;
            const guildDb = await database.getGuild(guild.id);

            if (!guildDb?.config.logging?.enabled || !guildDb.config.logging.editLogs) {
                return;
            }

            const log = guild.channels.cache.get(guildDb.config.logging.editLogs) as TextChannel;
            if (!log) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.logging.editLogs": "" } });
                return;
            }

            const date = new Date(Date.now());
            const author = message.author;

            const time = formatTime(date!);
            const user = formatUser(author);
            const channel = formatChannel(message.channel as TextChannel);
            const content = formatMessageDelete(message);
            const creation = formatDuration(message.createdAt);
            const file = content.length > 1000 || (content.match(/\n/g) ?? []).length > 12;

            if (file) {
                const content = formatMessageDelete(message, true);
                const line = `${time} <:messageDelete:829444584575598612> Message sent by ${user} has been deleted from ${channel} that was sent **${creation}**:\n**Content:**`;
                client.logs.push({ channel: log.id, content: line, attachment: { file: content, name: "DeleteLog.txt" } });
            } else {
                const content = formatMessageDelete(message);
                const line = `${time} <:messageDelete:829444584575598612> Message sent by ${user} has been deleted from ${channel} that was sent **${creation}**: ${content}`;
                client.logs.push({ channel: log.id, content: line });
            }
        } catch (error) {
            client.emit("error", error);
        }
    }
}

function formatChannel(channel: TextChannel): string {
    return `**${channel.name}** (<#${channel.id}>)`;
}

function formatMessageDelete(message: Message, file?: boolean): string {
    const content = sanitize(message.cleanContent);
    if (file) {
        return `${content}`;
    }
    return `**\nContent:** ${content}`;
}
