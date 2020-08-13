import Command from "../../command/Command";
import { Administration } from "../../Groups";
export default class Config extends Command {
    constructor() {
        super({ name: "Config", triggers: ["config", "cfg", "setup"], description: "Configures various settings for the guild", group: Administration });
    }
    run(_event) {
    }
}
//# sourceMappingURL=Config.js.map