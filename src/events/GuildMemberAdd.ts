import Event from "@event/Event";
import { GuildMember, TextChannel } from "discord.js";
import MyntClient from "~/MyntClient";
import { formatDuration, formatTime, formatUser } from "@utils/Format";

export default class GuildMemberAdd extends Event {
    public constructor() {
        super({ name: "guildMemberAdd" });
    }

    public async callback(client: MyntClient, member: GuildMember): Promise<void> {
        try {
            const guild = member.guild;
            const database = client.database;
            const guildDb = await database.getGuild(guild.id);
            if (!guildDb?.config.channels?.travelLogs) {
                return;
            }

            const log = guild.channels.cache.get(guildDb.config.channels.travelLogs) as TextChannel;
            if (!log) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.travelLogs": "" } });
                return;
            }

            const date = new Date(Date.now());

            const time = formatTime(date!);
            const user = formatUser(member.user);
            const age = formatDuration(member.user.createdAt);

            const line = `${time} <:userJoin:829444334021640223> ${user} joined the server. (Created ${age})`;
            client.logs.push({ channel: log.id, content: line });
        } catch (error) {
            client.emit("error", error);
        }
    }
}
