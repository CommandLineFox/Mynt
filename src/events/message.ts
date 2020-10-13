import Event from "@event/Event";
import MyntClient from "~/MyntClient";
import { Message } from "discord.js";
import { Guild } from "@models/Guild";

export const event = new Event("message", async (client: MyntClient, message: Message) => {
    if (message.author.bot) {
        return;
    }

    if (!message.guild) {
        return;
    }

    let guild = await client.database!.guilds.findOne({ id: message.guild!.id });
    if (!guild) {
        return;
    }

    if (guild.config.automod && guild.config.automod.enabled) {
        autoMod(client, message, guild);
    }
})

async function autoMod(client: MyntClient, message: Message, guild: Guild) {
    if (!guild.config.automod?.filter || !guild.config.overwrites) {
        return;
    }

    if (!guild.config.automod.filter.enabled || !guild.config.automod.filter.list || guild.config.automod.filter.list.length === 0) {
        return;
    }

    if (guild.config.overwrites.staffbypass && client.isMod(message.member!, message.guild!)) {
        return;
    }


    const content = message.content.normalize().toLowerCase();
    let text = "";

    for (let i = 0; i < message.content.length; i++) {
        if (content[i] >= "a" && content[i] <= "z") {
            text += content[i];
        }
    }
    
    for (const word of guild.config.automod.filter.list) {
        if (text.includes(word)) {
            message.delete({ timeout: 100, reason: "Automod - Word filter" });
        }
    }
}