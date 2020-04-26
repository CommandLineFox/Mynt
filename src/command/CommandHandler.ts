import MyntClient from "~/MyntClient";
import CommandRegistry from "@command/CommandRegistry";
import { Message } from "discord.js";
import CommandEvent from "@command/CommandEvent";

export default class CommandHandler {
    private readonly client: MyntClient;
    private mentions: string[];

    constructor (client: MyntClient) {
        this.client = client;
        this.mentions = [ `<@${this.client.user!.id}>`, `<@!${this.client.user!.id}>` ];
        client.on("message", (message) => {
            if (!message.author.bot) {
                this.handleMessage(message);
            }
        });
    }

    private handleMessage(message: Message) {
        const content = message.content;
        const prefix = this.client.getPrefix(message.guild!);

        if (content.startsWith(prefix)) {
            this.handlePrefix(message, content.slice(prefix.length).trim());
        }

        else if (content.startsWith(this.mentions[0])) {
            this.handleMention(message, content.slice(this.mentions![0].length).trim());
        }

        else if (content.startsWith(this.mentions[1])) {
            this.handleMention(message, content.slice(this.mentions![1].length).trim());
        }
    }

    private handlePrefix(message: Message, content: string) {
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

    private handleMention(message: Message, content: string) {
        if (content.length === 0) {
            message.reply(`My prefix here is \`${this.client.getPrefix(message.guild!)}\``);
            return;
        }
        this.handlePrefix(message, content);
    }
}