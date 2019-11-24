"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
const discord_js_1 = require("discord.js");
class Help extends Command_1.default {
    constructor() {
        super({ name: "Help", triggers: ["help", "commands", "cmds"], group: Groups_1.Basic });
    }
    run(event) {
        const help = new discord_js_1.RichEmbed()
            .setTitle("Here's the list of all my commands")
            .setColor("#61e096")
            .setFooter(`Requested by ${event.author.tag}`, event.author.avatarURL);
        event.send(help);
    }
}
exports.default = Help;
//# sourceMappingURL=Help.js.map