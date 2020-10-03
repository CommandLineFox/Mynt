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
    let guild = await client.database.guilds.findOne({ id: message.guild.id });
    if (!guild) {
        return;
    }
    if (guild.config.automod && guild.config.automod.enabled) {
        autoMod(client, message);
    }
});
async function autoMod(client, message) {
    if (!message.guild) {
        return;
    }
    const database = client.database;
    let guild = await database.guilds.findOne({ id: message.guild.id });
    if (!guild || !guild.config || !guild.config.automod || !guild.config.automod.filter || !guild.config.overwrites) {
        return;
    }
    if (guild.config.overwrites.staffbypass && client.isMod(message.member, message.guild)) {
        return;
    }
    const content = message.content.normalize();
    let text = "";
    for (let i = 0; i < message.content.length; i++) {
        if (content[i]) {
            text += content[i];
        }
    }
    console.log(text);
}
//# sourceMappingURL=Message.js.map