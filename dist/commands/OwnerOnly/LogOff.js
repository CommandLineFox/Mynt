import Command from "../../command/Command";
import { OwnerOnly } from "../../Groups";
export default class LogOff extends Command {
    constructor() {
        super({ name: "LogOff", triggers: ["logoff", "shutdown"], description: "Turns the bot off", group: OwnerOnly });
    }
    async run(event) {
        await event.message.delete();
        event.client.destroy();
    }
}
//# sourceMappingURL=LogOff.js.map