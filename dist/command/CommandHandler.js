"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommandRegistry_1 = __importDefault(require("./CommandRegistry"));
const CommandEvent_1 = __importDefault(require("./CommandEvent"));
class CommandHandler {
    constructor(client) {
        this.client = client;
        this.mentions = [`<@${this.client.user.id}>`, `<@!${this.client.user.id}>`];
        client.on("message", async (message) => {
            if (!message.author.bot) {
                await this.handleMessage(message);
            }
        });
    }
    async handleMessage(message) {
        const content = message.content;
        const prefix = await this.client.getPrefix(message.guild);
        if (content.startsWith(prefix)) {
            await this.handlePrefix(message, content.slice(prefix.length).trim());
        }
        else if (content.startsWith(this.mentions[0])) {
            await this.handleMention(message, content.slice(this.mentions[0].length).trim());
        }
        else if (content.startsWith(this.mentions[1])) {
            await this.handleMention(message, content.slice(this.mentions[1].length).trim());
        }
    }
    async handlePrefix(message, content) {
        if (content.length === 0) {
            return;
        }
        const [trigger, args = ""] = content.split(/\s+([\s\S]+)/);
        const command = CommandRegistry_1.default.getCommand(trigger);
        if (command === undefined) {
            return;
        }
        await command.execute(new CommandEvent_1.default(message, this.client, args));
    }
    async handleMention(message, content) {
        if (content.length === 0) {
            await message.reply(`My prefix here is \`${await this.client.getPrefix(message.guild)}\``);
            return;
        }
        await this.handlePrefix(message, content);
    }
}
exports.default = CommandHandler;
//# sourceMappingURL=CommandHandler.js.map