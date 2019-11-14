import Command from "../../command/Command";
import { Basic } from "../../Groups";
import CommandEvent from "../../command/CommandEvent";

export default class Echo extends Command {
    constructor () {
        super({name: "Echo", triggers: ["echo", "say"], group: Basic})
    }

    run(event: CommandEvent) {
        event.message.delete(100);
        event.send(event.argument);
    }
}