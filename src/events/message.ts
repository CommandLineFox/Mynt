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

    if (guild.config.automod) {
        autoMod(client, message, guild);
    }
})

function autoMod(client: MyntClient, message: Message, guild: Guild) {
    if (guild.config.staffBypass === true && client.isMod(message.member!, message.guild!)) {
        return;
    }

    if (guild.config.filter && guild.config.filter.enabled && filter(message, guild)) {
        return;
    }

    if (guild.config.adBlocker === true && adblock(message)) {
        console.log("Ad blocker go brrrr");
        return;
    }
}

function filter(message: Message, guild: Guild): boolean {
    if (!guild.config.filter?.list || guild.config.filter.list.length === 0) {
        return false;
    }

    const content = message.content.normalize().toLowerCase();
    let text = "";

    for (let i = 0; i < message.content.length; i++) {
        if (content[i] >= "a" && content[i] <= "z") {
            text += content[i];
        }
    }

    for (const word of guild.config.filter.list) {
        if (text.includes(word)) {
            message.delete({ timeout: 100, reason: "Automod - Word filter" });
            return true;
        }
    }

    return false;
}

function adblock(message: Message): boolean {
    const content = message.content;
    const regex = new RegExp("(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discord(app)?\.com\/invite)\/.+[a-z]");

    if (content.match(regex)) {
        message.delete({ timeout: 100, reason: "Automod - Ad blocker" });
        return true;
    }

    return false;
}