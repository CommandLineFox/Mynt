import Event from "@event/Event";
import { Role, TextChannel } from "discord.js";
import MyntClient from "~/MyntClient";
import { formatTime, formatUser } from "@utils/Format";

export default class RoleDelete extends Event {
    public constructor() {
        super({ name: "roleDelete" });
    }

    public async callback(client: MyntClient, role: Role): Promise<void> {
        try {
            const guild = role.guild;
            const database = client.database;
            const guildDb = await database.getGuild(guild.id);
            if (!guildDb?.config.logging?.roleChanges) {
                return;
            }

            const log = guild.channels.cache.get(guildDb.config.logging.roleChanges) as TextChannel;
            if (!log) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.logging.roleChanges": "" } });
                return;
            }

            const audit = await guild.fetchAuditLogs({ type: "ROLE_DELETE", limit: 1 });
            const entry = audit.entries.first();
            if (!entry) {
                client.logs.push({ channel: log.id, content: `A role has been deleted, **${role.name}**` });
            }

            const date = entry?.createdAt;
            const executor = entry?.executor;

            const time = formatTime(date!);
            const user = formatUser(executor!);

            const line = `${time} <:roleDelete:829444972864471060> ${user} deleted a role **${role.name}**`;
            client.logs.push({ channel: log.id, content: line });
        } catch (error) {
            client.emit("error", error);
        }
    }
}
