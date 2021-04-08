import Event from "@event/Event";
import { GuildMember, TextChannel } from "discord.js";
import MyntClient from "~/MyntClient";
import { formatTime, formatUser } from "@utils/Utils";

export default class GuildMemberRemove extends Event {
    public constructor() {
        super({ name: "guildMemberRemove" });
    }

    public async callback(client: MyntClient, member: GuildMember): Promise<void> {
        try {
            const guild = member.guild;
            const database = client.database;
            const guildDb = await database.getGuild(guild.id);
            if (!guildDb?.config.channels?.joinLogs) {
                return;
            }

            const log = guild.channels.cache.get(guildDb.config.channels.joinLogs) as TextChannel;
            if (!log) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.joinLogs": "" } });
                return;
            }

            const date = new Date(Date.now());

            const time = formatTime(date!);
            const user = formatUser(member.user);

            const line = `${time} <:userLeave:829444398785232896> ${user} has left the server.`;
            log.send(line);
        } catch (error) {
            client.emit("error", error);
        }
    }
}