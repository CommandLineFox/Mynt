import Event from "@event/Event";
import { MessageEmbed, TextChannel } from "discord.js";
import MyntClient from "~/MyntClient";

export default class Errors extends Event {
    public constructor() {
        super({ name: "error" });
    }

    public callback(client: MyntClient, error: Error): void {
        const channel = client.channels.cache.get(client.config.errors) as TextChannel;
        if (!channel) {
            console.log(error);
            return;
        }

        const embed = new MessageEmbed()
            .setTitle(error.name)
            .setTimestamp()
            .setColor("#61e096")
            .setDescription(`${error.message}\n\`\`\`${error.stack}\`\`\``);

        channel.send({ embeds: [embed] });
    }
}
