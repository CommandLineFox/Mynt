"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
const discord_js_1 = require("discord.js");
class Avatar extends Command_1.default {
    constructor() {
        super({
            name: "Avatar",
            triggers: ["avatar", "av", "pfp"],
            description: "Displays the specified user's avatar",
            group: Groups_1.Moderation
        });
    }
    async run(event) {
        const guild = event.guild;
        const [argument] = event.argument.split(/\s/, 1);
        let member = guild.members.cache.find(member => argument === member.id || argument === `<@${member.id}>` || argument === `<@!${member.id}>` || argument === member.user.username || argument === member.user.tag);
        if (!member) {
            member = event.member;
        }
        const avatar = new discord_js_1.MessageEmbed()
            .setTitle(`${member.user.tag}'s avatar:`)
            .setImage(member.user.displayAvatarURL())
            .setFooter(`Requested by ${event.author.username}`, event.author.displayAvatarURL());
        event.channel.send({ embed: avatar });
    }
}
exports.default = Avatar;
//# sourceMappingURL=Avatar.js.map