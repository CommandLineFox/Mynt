import Event from "@event/Event";
import MyntClient from "~/MyntClient";
import { unban, unmute } from "@utils/Moderation";
import { iterator } from "@utils/Types";
import { TextChannel } from "discord.js";

export default class Ready extends Event {
    public constructor() {
        super({ name: "ready" });
    }

    public async callback(client: MyntClient): Promise<void> {
        console.log(`Logged in as ${client.user?.tag}`);

        const database = client.database;

        client.moderationInterval = setInterval(async () => {
            const cursor = database.infractions.find({ complete: false, end: { "$lt": Date.now() + 1000 } });

            while (await cursor.hasNext()) {
                const infraction = await cursor.next();
                // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
                switch (infraction!.action) {
                    case "Ban": {
                        unban(client, infraction!.guild, infraction!.user);
                        break;
                    }

                    case "Mute": {
                        unmute(client, infraction!.guild, infraction!.user);
                        break;
                    }
                }

                client.database.infractions.updateOne({ _id: infraction!._id }, { "complete": true });
            }
        }, client.config.intervals.moderation);

        client.logInterval = setInterval(async () => {
            let logs = iterator(client.logs);

            while (logs.hasNext()) {
                const nextLog = logs.next();
                const current = client.logs.filter(l => l.channel === nextLog.channel);
                client.logs = client.logs.filter(l => !current.includes(l));
                logs = iterator(client.logs);

                const channel = client.channels.cache.get(nextLog.channel) as TextChannel | undefined;
                if (!channel) {
                    continue;
                }

                let message = "";
                for (const log of current) {
                    if (message.length + log.content.length < 2000) {
                        message += log.content + "\n";
                    } else {
                        await channel.send(message);
                        message = log.content + "\n";
                    }

                    if (log.attachment) {
                        await channel.send({ content: message, files: [{ name: log.attachment.name, attachment: Buffer.from(log.attachment.file, "utf8") }] });
                        message = "";
                    }
                }

                await channel.send(message);
            }
        }, client.config.intervals.logging);
    }
}
