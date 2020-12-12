"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = __importDefault(require("../event/Event"));
const discord_js_1 = require("discord.js");
class Errors extends Event_1.default {
    constructor() {
        super({ name: "error" });
    }
    callback(client, error) {
        const channel = client.channels.cache.get(client.config.errors);
        if (!channel) {
            console.log(error);
            return;
        }
        const embed = new discord_js_1.MessageEmbed()
            .setTitle(error.name)
            .setTimestamp()
            .setColor("#61e096")
            .setDescription(`${error.message}\n\`\`\`${error.stack}\`\`\``);
        channel.send({ embed: embed });
    }
}
exports.default = Errors;
//# sourceMappingURL=Error.js.map