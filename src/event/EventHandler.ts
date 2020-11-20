import MyntClient from "~/MyntClient";
import {promisify} from "util";
import {readdir} from "fs";

export async function EventHandler(client: MyntClient): Promise<void> {
    const readDir = promisify(readdir);

    const events = await readDir("./dist/events");
    for (const item of events) {
        if (item.endsWith(".js")) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
            const {event} = require(`../events/${item}`);
            client.on(event.name, (...args) => {
                event.func(client, ...args);
            });
        }
    }
}
