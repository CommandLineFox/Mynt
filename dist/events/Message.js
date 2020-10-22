"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.event = void 0;
const Event_1 = __importDefault(require("../event/Event"));
exports.event = new Event_1.default("message", async (client, message) => {
    if (message.author.bot) {
        return;
    }
    if (!message.guild) {
        return;
    }
    let guild = await client.database.guilds.findOne({ id: message.guild.id });
    if (!guild) {
        return;
    }
    if (guild.config.automod) {
        autoMod(client, message, guild);
    }
});
function autoMod(client, message, guild) {
    if (guild.config.staffbypass === true && client.isMod(message.member, message.guild)) {
        return;
    }
    if (guild.config.filter && guild.config.filter.enabled && filter(message, guild)) {
        return;
    }
    if (guild.config.adblocker === true && adblock(message)) {
        console.log("Ad blocker go brrrr");
        return;
    }
}
function filter(message, guild) {
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
            message.delete({ timeout: 100, reason: "Automod - Word filter" });
            return true;
        }
    }
    return false;
}
function adblock(message) {
    const content = message.content;
    const regex = new RegExp("(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discord(app)?\.com\/invite)\/.+[a-z]");
    if (content.match(regex)) {
        message.delete({ timeout: 100, reason: "Automod - Ad blocker" });
        return true;
    }
    return false;
}
//# sourceMappingURL=Message.js.map