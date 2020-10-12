import Event from "../event/Event";
export const event = new Event("message", async (client, message) => {
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
    if (guild.config.automod && guild.config.automod.enabled) {
        autoMod(client, message, guild);
    }
});
async function autoMod(client, message, guild) {
    var _a;
    if (!((_a = guild.config.automod) === null || _a === void 0 ? void 0 : _a.filter) || !guild.config.overwrites) {
        return;
    }
    if (!guild.config.automod.filter.enabled || !guild.config.automod.filter.list || guild.config.automod.filter.list.length === 0) {
        return;
    }
    if (guild.config.overwrites.staffbypass && client.isMod(message.member, message.guild)) {
        return;
    }
    const content = message.content.normalize().toLowerCase();
    let text = "";
    for (let i = 0; i < message.content.length; i++) {
        if (content[i] >= 'a' && content[i] <= 'z') {
            text += content[i];
        }
    }
    for (const word of guild.config.automod.filter.list) {
        if (text.includes(word)) {
            message.delete({ timeout: 100, reason: "Automod - Word filter" });
        }
    }
}
//# sourceMappingURL=Message.js.map