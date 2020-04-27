"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
const discord_js_1 = require("discord.js");
const ArgumentHandler_1 = __importDefault(require("../../command/ArgumentHandler"));
class Avatar extends Command_1.default {
    constructor() {
        super({ name: "Avatar", triggers: ["avatar", "av", "pfp"], description: "Displays the specified user's avatar", group: Groups_1.Moderation });
    }
    async run(event) {
        const args = await ArgumentHandler_1.default.getArguments(event, event.argument, "member");
        if (!args) {
            event.reply("invalid arguments.");
            return;
        }
        const [member] = args;
        const avatar = new discord_js_1.MessageEmbed()
            .setTitle(`${member.user.tag}'s avatar:`)
            .setImage(member.user.displayAvatarURL)
            .setFooter(`Requested by ${event.author.username}`, event.author.displayAvatarURL());
        event.channel.send({ embed: avatar });
    }
}
exports.default = Avatar;
//# sourceMappingURL=Avatar.js.map