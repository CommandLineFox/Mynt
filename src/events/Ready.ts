import Event from "@event/Event";
import MyntClient from "~/MyntClient";
import { handleInfraction, pullInfractions } from "@utils/Utils";

export default class Ready extends Event {
    public constructor() {
        super({ name: "ready" });
    }

    public async callback(client: MyntClient): Promise<void> {
        console.log(`Logged in as ${client.user?.tag}`);
        await client.user?.setActivity("with Alex", { type: "PLAYING" });

        client.infractions = await pullInfractions(client);
        client.infractions.forEach((infraction) => {
            if (infraction.end <= Date.now() + 200) {
                handleInfraction(infraction);
            } else {
                client.setTimeout(() => {
                    handleInfraction(infraction);
                }, infraction.end - Date.now());
            }
        });
    }
}
