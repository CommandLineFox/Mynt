"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandRegistry_1 = require("../command/CommandRegistry");
const CommandEvent_1 = require("./CommandEvent");
class CommandHandler {
    constructor(client) {
        this.client = client;
        this.mentions = [`<@${this.client.user.id}>`, `<@!${this.client.user.id}>`];
        client.on("message", (message) => {
            this.handleMessage(message);
        });
    }
    handleMessage(message) {
        const content = message.content;
        const prefix = this.client.getPrefix(message.guild);
        if (content.startsWith(prefix)) {
            this.handlePrefix(message, content.slice(prefix.length).trim());
        }
        else if (content.startsWith(this.mentions[0])) {
            this.handleMention(message, content.slice(this.mentions[0].length).trim());
        }
        else if (content.startsWith(this.mentions[1])) {
            this.handleMention(message, content.slice(this.mentions[1].length).trim());
        }
    }
    handlePrefix(message, content) {
        if (content.length === 0) {
            return;
        }
        const [trigger, args = ""] = content.split(/\s+([\s\S]+)/);
        const command = CommandRegistry_1.default.getCommand(trigger);
        if (command === undefined) {
            return;
        }
        command.execute(new CommandEvent_1.default(message, this.client, args));
    }
    handleMention(message, content) {
        if (content.length === 0) {
            message.reply(`My prefix here is \`${this.client.getPrefix(message.guild)}>\``);
            return;
        }
        this.handlePrefix(message, content);
    }
}
exports.default = CommandHandler;
//# sourceMappingURL=CommandHandler.js.map