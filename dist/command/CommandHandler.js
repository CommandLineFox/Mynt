import CommandRegistry from "./CommandRegistry";
import CommandEvent from "./CommandEvent";
export default class CommandHandler {
    constructor(client) {
        this.client = client;
        this.mentions = [`<@${this.client.user.id}>`, `<@!${this.client.user.id}>`];
        client.on("message", (message) => {
            if (!message.author.bot) {
                this.handleMessage(message);
            }
        });
    }
    async handleMessage(message) {
        const content = message.content;
        const prefix = await this.client.getPrefix(message.guild);
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
        const command = CommandRegistry.getCommand(trigger);
        if (command === undefined) {
            return;
        }
        command.execute(new CommandEvent(message, this.client, args));
    }
    async handleMention(message, content) {
        if (content.length === 0) {
            message.reply(`My prefix here is \`${await this.client.getPrefix(message.guild)}\``);
            return;
        }
        this.handlePrefix(message, content);
    }
}
//# sourceMappingURL=CommandHandler.js.map