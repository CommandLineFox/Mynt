import MyntClient from "~/MyntClient";
import { promisify } from "util";
import { readdir } from "fs";

export async function EventHandler(client: MyntClient) {
    const readDir = promisify(readdir);

    const events = await readDir("./dist/events");
    for (const item of events) {
        if (item.endsWith('.js')) {
            const { event } = require(`../events/${item}`);
            client.on(event.name, (...args) => {
                event.func(client, ...args);
            }); 
        }
    }
}