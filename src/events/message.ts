import Event from "@event/Event";
import MyntClient from "~/MyntClient";
import { Message } from "discord.js";

export const event = new Event("message", async (client: MyntClient, message: Message) => {
    if (message.author.bot) {
        return;
    }


    let guild = await client.database!.guilds.findOne({ id: message.guild!.id });
    if (!guild) {
        return;
    }

    if (guild.config.automod && guild.config.automod.enabled) {
        autoMod(client, message);
    }
})

async function autoMod(client: MyntClient, message: Message) {
    if (!message.guild) {
        return;
    }

    const database = client.database;
    let guild = await database!.guilds.findOne({ id: message.guild!.id });

    if (!guild || !guild.config || !guild.config.automod || !guild.config.automod.filter || !guild.config.overwrites) {
        return;
    }

    if (guild.config.overwrites.staffbypass && client.isMod(message.member!, message.guild)) {
        return;
    }

    const content = message.content.normalize();
    let text = "";

    for (let i = 0; i < message.content.length; i++) {
        if (content[i]) {
            text += content[i];
        }
    }
    console.log(text);
}