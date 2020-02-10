import Command from "../../command/Command";
import { OwnerOnly } from "../../Groups";
import CommandEvent from "../../command/CommandEvent";

export default class LogOff extends Command {
    constructor () {
        super({name: "LogOff", triggers: ["logoff", "shutdown"], description: "Turns the bot off", group: OwnerOnly});
    }

    run(event: CommandEvent) {
        event.message.delete(100);
        event.client.destroy();
    }
}