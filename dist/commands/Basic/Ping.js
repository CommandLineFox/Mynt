"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
const discord_js_1 = require("discord.js");
class Ping extends Command_1.default {
    constructor() {
        super({ name: "Ping", triggers: ["ping"], description: "Shows the bot's response time", group: Groups_1.Basic });
    }
    run(event) {
        event.send(`Pinging...`)
            .then((msg) => {
            msg = msg;
            const ping = new discord_js_1.MessageEmbed()
                .addField(`:hourglass: Response time: `, `${msg.createdTimestamp - event.message.createdTimestamp}ms`, false)
                .addField(`:heartbeat: Bot ping: `, `${Math.round(event.client.ws.ping)}ms`, true);
            msg.edit({ embed: ping });
        });
    }
}
exports.default = Ping;
//# sourceMappingURL=Ping.js.map