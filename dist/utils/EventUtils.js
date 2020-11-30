"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inviteBlock = exports.filter = exports.autoMod = exports.generateMail = void 0;
const discord_js_1 = require("discord.js");
async function generateMail(client, message) {
    var _a;
    const author = message.author;
    const received = new discord_js_1.MessageEmbed()
        .setTitle(author.username)
        .setDescription(message)
        .setColor("#61e096")
        .setFooter("ID: " + author.id, author.displayAvatarURL());
    if (message.attachments && message.attachments.first()) {
        received.setImage((_a = message.attachments.first()) === null || _a === void 0 ? void 0 : _a.url);
    }
    const channel = client.channels.cache.find(channel => channel.id == client.config.mail);
    if (channel) {
        await channel.send({ embed: received });
    }
}
exports.generateMail = generateMail;
function autoMod(client, message, guild) {
    if (guild.config.staffBypass === true && client.isMod(message.member, message.guild)) {
        return;
    }
    if (guild.config.filter && guild.config.filter.enabled && filter(message, guild)) {
        return;
    }
    if (guild.config.inviteBlocker === true && inviteBlock(message)) {
        return;
    }
}
exports.autoMod = autoMod;
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
            message.delete({ timeout: 100, reason: "AutoMod - Word filter" })
                .catch((err) => {
                console.log(err);
            });
            return true;
        }
    }
    return false;
}
exports.filter = filter;
function inviteBlock(message) {
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
exports.inviteBlock = inviteBlock;
//# sourceMappingURL=EventUtils.js.map