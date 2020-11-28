import Event from "@event/Event";
import MyntClient from "~/MyntClient";

export default class Ready extends Event {
    public constructor() {
        super({ name: "ready" });
    }

    public async callback(client: MyntClient): Promise<void> {
        console.log(`Logged in as ${client.user?.tag}`);
        await client.user?.setActivity("with Alex", {type: "PLAYING"});
    }
}
