import { Message } from "discord.js";
import { Guild } from "@models/Guild";
import MyntClient from "~/MyntClient";

export function autoMod(client: MyntClient, message: Message, guild: Guild): void {
    if (guild.config.options?.staffBypass === true && client.isMod(message.member!, message.guild!)) {
        return;
    }

    if (guild.config.automod?.filter?.enabled === true && filter(message, guild)) {
        return;
    }

    if (guild.config.automod?.antiAdvert === true && inviteBlock(message)) {
        return;
    }
}

function filter(message: Message, guild: Guild): boolean {
    if (!guild.config.automod?.filter?.list || guild.config.automod.filter.list.length === 0) {
        return false;
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
            message.delete({ timeout: 100, reason: "AutoMod - Word filter" })
                .catch((error) => {
                    console.log(error);
                });
            return true;
        }
    }

    return false;
}

function inviteBlock(message: Message): boolean {
    const content = message.content;
    const regex = new RegExp("(https?://)?(www.)?(discord.(gg|io|me|li)|discord(app)?.com/invite)/.+[a-z]");

    if (content.match(regex)) {
        message.delete({ timeout: 100, reason: "AutoMod - Invite blocker" })
            .catch((error) => {
                console.log(error);
            });
        return true;
    }

    return false;
}
