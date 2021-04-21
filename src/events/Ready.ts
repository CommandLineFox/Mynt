import Event from "@event/Event";
import MyntClient from "~/MyntClient";
import { unban, unmute } from "@utils/Moderation";

export default class Ready extends Event {
    public constructor() {
        super({ name: "ready" });
    }

    public async callback(client: MyntClient): Promise<void> {
        console.log(`Logged in as ${client.user?.tag}`);

        const database = client.database;

        client.interval = setInterval(async () => {
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
        }, 30000);
    }
}
