import Event from "@event/Event";
import MyntClient from "~/MyntClient";
import { Message, TextChannel } from "discord.js";
import { formatTime, formatUser, sanitize } from "@utils/Format";
import { autoMod } from "@utils/Automod";

export default class MessageUpdate extends Event {
    public constructor() {
        super({ name: "messageUpdate" });
    }

    public async callback(client: MyntClient, oldMessage: Message, newMessage: Message): Promise<void> {
        try {
            if (newMessage.author.bot) {
                return;
            }

            if (newMessage.content == oldMessage.content) {
                return;
            }

            const guild = newMessage.guild;
            if (!guild) {
                return;
            }

            const database = client.database;
            const guildDb = await database.getGuild(guild.id);
            if (!guildDb) {
                return;
            }

            if (guildDb.config.automod) {
                autoMod(client, newMessage, guildDb);
            }

            if (!guildDb.config.channels?.editLogs) {
                return;
            }

            const log = guild.channels.cache.get(guildDb.config.channels.editLogs) as TextChannel;
            if (!log) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.editLogs": "" } });
                return;
            }

            const date = newMessage.editedAt;
            const author = newMessage.author;

            const time = formatTime(date!);
            const user = formatUser(author);
            const channel = formatChannel(newMessage.channel as TextChannel);
            const text = oldMessage.cleanContent + newMessage.cleanContent;
            const file = text.length > 1000 || (text.match(/\n/g) ?? []).length > 12;

            if (file) {
                const content = formatMessageUpdate(oldMessage, newMessage, true);
                const line = `${time} <:messageUpdate:829446237220634664> Message sent by ${user} has been edited in ${channel}:`;
                const attachment = { attachment: Buffer.from(content, "utf8"), name: "EditLog.txt" };
                log.send(line, { files: [attachment] });
            } else {
                const content = formatMessageUpdate(oldMessage, newMessage);
                const line = `${time} <:messageUpdate:829446237220634664> Message sent by ${user} has been edited in ${channel}: ${content}`;
                log.send(line);
            }
        } catch (error) {
            client.emit("error", error);
        }
    }
}

function formatChannel(channel: TextChannel): string {
    return `**${channel.name}** (<#${channel.id}>)`;
}

function formatMessageUpdate(oldMessage: Message, newMessage: Message, file?: boolean) {
    const old = sanitize(oldMessage.cleanContent);
    const current = sanitize(newMessage.cleanContent);
    if (file) {
        return `Old: ${old}\nNew: ${current}`;
    }

    return `**\nOld:** ${old}\n**New:** ${current}`;
}
