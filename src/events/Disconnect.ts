import Event from "@event/Event";
import MyntClient from "~/MyntClient";

export default class Disconnect extends Event {
    public constructor() {
        super({ name: "disconnect" });
    }

    public callback(client: MyntClient): void {
        if (client.moderationInterval) {
            client.moderationInterval.unref();
        }

        if (client.logInterval) {
            client.logInterval.unref();
        }
    }
}
