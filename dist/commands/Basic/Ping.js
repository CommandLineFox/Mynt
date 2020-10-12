import Command from "../../command/Command";
import { Basic } from "../../Groups";
import { MessageEmbed } from "discord.js";
export default class Ping extends Command {
    constructor() {
        super({ name: "Ping", triggers: ["ping"], description: "Shows the bot's response time", group: Basic });
    }
    run(event) {
        event.send(`Pinging...`)
            .then((msg) => {
            msg = msg;
            const ping = new MessageEmbed()
                .addField(`:hourglass: Response time: `, `${msg.createdTimestamp - event.message.createdTimestamp}ms`, false)
                .addField(`:heartbeat: Bot ping: `, `${Math.round(event.client.ws.ping)}ms`, true);
            msg.edit({ content: "", embed: ping });
        });
    }
}
//# sourceMappingURL=Ping.js.map