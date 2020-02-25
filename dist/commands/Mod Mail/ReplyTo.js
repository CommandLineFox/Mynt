"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
const ArgumentHandler_1 = __importDefault(require("../../command/ArgumentHandler"));
class ReplyTo extends Command_1.default {
    constructor() {
        super({ name: "ReplyTo", triggers: ["replyto"], description: "Sends a message to a specified user", group: Groups_1.ModMail });
    }
    async run(event) {
        const args = await ArgumentHandler_1.default.getArguments(event, event.argument, "member", "string");
        if (!args) {
            event.reply("invalid arguments.");
            return;
        }
        const [member, text] = args;
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