"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
class ReplyTo extends Command_1.default {
    constructor() {
        super({ name: "ReplyTo", triggers: ["replyto"], description: "Sends a message to a specified user", group: Groups_1.ModMail });
    }
    async run(event) {
        const guild = event.guild;
        const [user, text] = event.argument.split(/\s+/, 3);
        const member = guild.members.cache.find(member => user === member.id || user === `<@${member.id}` || user === `<@!${member.id}` || user === member.user.username || user === member.user.tag);
        if (!member) {
            event.send(`Couldn't find the user you're looking for`);
            return;
        }
        member.user.send(text)
            .catch(() => {
            event.reply("the specified user has their DMs disabled or has me blocked.");
            return;
        })
            .then(() => {
            event.send(`Successfully sent the message to ${member.user.tag}.`);
        });
    }
}
exports.default = ReplyTo;
//# sourceMappingURL=ReplyTo.js.map