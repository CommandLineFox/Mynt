import Command from "@command/Command";
import { Basic } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { MessageEmbed, Message } from "discord.js";

export default class Ping extends Command {
    constructor() {
        super({ name: "Ping", triggers: ["ping"], description: "Shows the bot's response time", group: Basic });
    }

    run(event: CommandEvent) {
        event.send(`Pinging...`)
            .then((msg) => {
                msg = msg as Message;
                const ping = new MessageEmbed()
                    .addField(`:hourglass: Response time: `, `${msg.createdTimestamp - event.message.createdTimestamp}ms`, false)
                    .addField(`:heartbeat: Bot ping: `, `${Math.round(event.client.ws.ping)}ms`, true);
                msg.edit({ embed: ping });
            });
    }
}