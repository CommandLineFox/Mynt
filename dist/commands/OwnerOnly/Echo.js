import Command from "../../command/Command";
import { OwnerOnly } from "../../Groups";
export default class Echo extends Command {
    constructor() {
        super({ name: "Echo", triggers: ["echo", "say"], description: "Repeats the message", group: OwnerOnly });
    }
    run(event) {
        event.message.delete({ timeout: 100 });
        event.send(event.argument);
    }
}
//# sourceMappingURL=Echo.js.map