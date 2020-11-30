import Event from "@event/Event";
import MyntClient from "~/MyntClient";
import {Message} from "discord.js";
import { generateMail, autoMod } from "@utils/EventUtils";

export default class MessageEvent extends Event {
    public constructor() {
        super({name: "message"});
    }

    public async callback(client: MyntClient, message: Message): Promise<void> {
        if (message.author.bot) {
            return;
        }

        if (!message.guild && !message.author.bot) {
            client.lastDmAuthor = message.author;
            await generateMail(client, message);
        }

        if (!message.guild) {
            return;
        }

        const guild = await client.getGuildFromDatabase(client.database!, message.guild.id);
        if (!guild) {
            return;
        }

        if (guild.config.automod) {
            autoMod(client, message, guild);
        }
    }
}
