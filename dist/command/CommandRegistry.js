"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Echo_1 = require("../commands/Basic/Echo");
class CommandRegistry {
    constructor() {
        this.commands = [
            new Echo_1.default()
        ];
        this.groups = this.commands.map((command) => command.group).filter((group, index, self) => self.indexOf(group) === index);
    }
    getCommands(group) {
        return this.commands.filter((command) => command.group === group);
    }
    getCommand(trigger) {
        return this.commands.find((command) => command.triggers.includes(trigger.toLowerCase()));
    }
}
exports.default = new CommandRegistry();
//# sourceMappingURL=CommandRegistry.js.map