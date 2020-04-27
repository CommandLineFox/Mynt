"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
const discord_js_1 = require("discord.js");
const CommandRegistry_1 = __importDefault(require("../../command/CommandRegistry"));
class Help extends Command_1.default {
    constructor() {
        super({ name: "Help", triggers: ["help", "commands", "cmds"], description: "Displays all my commands", group: Groups_1.Basic });
    }
    run(event) {
        const help = new discord_js_1.MessageEmbed()
            .setTitle("Here's the list of all my commands")
            .setColor("#61e096")
            .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());
        CommandRegistry_1.default.groups.forEach((group) => {
            if (group.ownerOnly && !event.client.isOwner(event.author)) {
                return;
            }
            const commands = group.commands.map((command) => `${command.name} (\`${command.triggers.join('`,`')}\`) -> ${command.description}`);
            if (commands.length === 0) {
                return;
            }
            help.addField(group.name, commands.join('\n'));
        });
        event.send({ embed: help });
    }
}
exports.default = Help;
//# sourceMappingURL=Help.js.map