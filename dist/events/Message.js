"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = __importDefault(require("../event/Event"));
const EventUtils_1 = require("../utils/EventUtils");
class MessageEvent extends Event_1.default {
    constructor() {
        super({ name: "message" });
    }
    async callback(client, message) {
        if (message.author.bot) {
            return;
        }
        if (!message.guild && !message.author.bot) {
            client.lastDmAuthor = message.author;
            await EventUtils_1.generateMail(client, message);
        }
        if (!message.guild) {
            return;
        }
        const guild = await client.getGuildFromDatabase(client.database, message.guild.id);
        if (!guild) {
            return;
        }
        if (guild.config.automod) {
            EventUtils_1.autoMod(client, message, guild);
        }
    }
}
exports.default = MessageEvent;
//# sourceMappingURL=Message.js.map