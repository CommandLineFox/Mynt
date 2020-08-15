"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
class CommandEvent {
    constructor(message, client, argument) {
        this.message = message;
        this.client = client;
        this.author = message.author;
        this.argument = argument;
        this.channel = message.channel;
        this.isFromGuild = this.channel.type === "text";
        this.textChannel = this.channel instanceof discord_js_1.TextChannel ? this.channel : undefined;
        this.guild = message.guild;
        this.member = message.member;
    }
    send(content, options) {
        return this.channel.send(content, options);
    }
    reply(content, options) {
        return this.message.reply(content, options);
    }
}
exports.default = CommandEvent;
//# sourceMappingURL=CommandEvent.js.map