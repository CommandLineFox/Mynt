"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
const Utils_1 = require("../../utils/Utils");
class ReplyTo extends Command_1.default {
    constructor() {
        super({
            name: "ReplyTo",
            triggers: ["replyto"],
            description: "Sends a message to a specified user",
            group: Groups_1.Mail
        });
    }
    async run(event) {
        const client = event.client;
        try {
            const guild = event.guild;
            const [user, text] = Utils_1.splitArguments(event.argument, 2);
            const member = await client.getMember(user, guild);
            if (!member) {
                await event.send("Couldn't find the user you're looking for");
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
        catch (error) {
            client.emit("error", error);
        }
    }
}
exports.default = ReplyTo;
//# sourceMappingURL=ReplyTo.js.map