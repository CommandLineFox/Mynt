import MyntClient from "~/MyntClient";
import EventRegistry from "./EventRegistry";

export default class EventHandler {
    public readonly client: MyntClient;

    public constructor(client: MyntClient) {
        this.client = client;

        for (const event of EventRegistry.events) {
            client.on(event.name, (...args) => {
                console.log(`Haha yes fired ${event.name}`);
                event.callback(client, ...args);
            });
        }
    }
}
