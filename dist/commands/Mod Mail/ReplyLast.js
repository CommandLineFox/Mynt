"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
class ReplyLast extends Command_1.default {
    constructor() {
        super({ name: "ReplyLast", triggers: ["replylast"], description: "Replies to the last received DM", group: Groups_1.ModMail });
    }
    run(event) {
        const argument = event.argument;
        const lastDm = event.client.lastDmAuthor;
        if (!lastDm) {
            event.send("Unable to find the last DM.");
            return;
        }
        if (!argument) {
            event.reply("you can't send an empty message to users.");
        }
        lastDm.send(argument)
            .catch(() => {
            event.reply("the specified user has their DMs disabled or has me blocked.");
            return;
        })
            .then(() => {
            event.send(`Successfully sent the message to ${lastDm.tag}.`);
        });
    }
}
exports.default = ReplyLast;
//# sourceMappingURL=ReplyLast.js.map