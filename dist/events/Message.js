"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = __importDefault(require("../event/Event"));
class MessageEvent extends Event_1.default {
    constructor() {
        super({ name: "message" });
    }
    async func(client, message) {
        if (message.author.bot) {
            return;
        }
        if (!message.guild) {
            return;
        }
        const guild = await client.getGuildFromDatabase(client.database, message.guild.id);
        if (!guild) {
            return;
        }
        if (guild.config.automod) {
            this.autoMod(client, message, guild);
        }
    }
    autoMod(client, message, guild) {
        if (guild.config.staffBypass === true && client.isMod(message.member, message.guild)) {
            return;
        }
        if (guild.config.filter && guild.config.filter.enabled && this.filter(message, guild)) {
            return;
        }
        if (guild.config.inviteBlocker === true && this.inviteBlock(message)) {
            return;
        }
    }
    filter(message, guild) {
        var _a;
        if (!((_a = guild.config.filter) === null || _a === void 0 ? void 0 : _a.list) || guild.config.filter.list.length === 0) {
            return false;
        }
        const content = message.content.normalize().toLowerCase();
        let text = "";
        for (let i = 0; i < message.content.length; i++) {
            if (content[i] >= "a" && content[i] <= "z") {
                text += content[i];
            }
        }
        for (const word of guild.config.filter.list) {
            if (text.includes(word)) {
                message.delete({ timeout: 100, reason: "AutoMod - Word filter" })
                    .catch((err) => {
                    console.log(err);
                });
                return true;
            }
        }
        return false;
    }
    inviteBlock(message) {
        const content = message.content;
        const regex = new RegExp("(https?://)?(www.)?(discord.(gg|io|me|li)|discord(app)?.com/invite)/.+[a-z]");
        if (content.match(regex)) {
            message.delete({ timeout: 100, reason: "AutoMod - Invite blocker" })
                .catch((err) => {
                console.log(err);
            });
            return true;
        }
        return false;
    }
}
exports.default = MessageEvent;
//# sourceMappingURL=Message.js.map