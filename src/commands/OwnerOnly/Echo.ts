import Command from "@command/Command";
import { OwnerOnly } from "~/Groups";
import CommandEvent from "@command/CommandEvent";

export default class Echo extends Command {
    constructor() {
        super({ name: "Echo", triggers: ["echo", "say"], description: "Repeats the message", group: OwnerOnly });
    }

    run(event: CommandEvent) {
        event.message.delete({ timeout: 100 });
        event.send(event.argument);
    }
}