"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class CommandRegistry {
    constructor() {
        this.commands = this.loadCommands();
        this.groups = this.loadGroups();
    }
    getCommands(group) {
        return this.commands.filter((command) => command.group === group);
    }
    getCommand(trigger) {
        return this.commands.find((command) => command.triggers.includes(trigger.toLowerCase()));
    }
    loadCommands() {
        const commands = [];
        const groups = fs_1.readdirSync("./dist/commands");
        for (const group of groups) {
            const folder = fs_1.statSync(`./dist/commands/${group}`);
            if (!folder) {
                continue;
            }
            const files = fs_1.readdirSync(`./dist/commands/${group}`);
            for (const file of files) {
                if (!file.endsWith(".js")) {
                    continue;
                }
                const path = `../commands/${group}/${file.slice(0, -3)}`;
                let command;
                try {
                    command = require(path).default;
                    delete require.cache[require.resolve(path)];
                }
                catch (error) {
                    console.log(error);
                }
                commands.push(new command);
            }
        }
        return commands;
    }
    loadGroups() {
        return this.commands.map((command) => command.group).filter((group, index, self) => self.indexOf(group) === index);
    }
}
exports.default = new CommandRegistry();
//# sourceMappingURL=CommandRegistry.js.map