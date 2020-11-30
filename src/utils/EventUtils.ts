import { Message, MessageEmbed, TextChannel } from "discord.js";
import { Guild } from "@models/Guild";
import MyntClient from "~/MyntClient";

export async function generateMail(client: MyntClient, message: Message): Promise<void> {
    const author = message.author;
    const received = new MessageEmbed()
        .setTitle(author.username)
        .setDescription(message)
        .setColor("#61e096")
        .setFooter("ID: " + author.id, author.displayAvatarURL());
    if (message.attachments && message.attachments.first()) {
        received.setImage(message.attachments.first()?.url as string);
    }

    const channel = client.channels.cache.find(channel => channel.id == client.config.mail);

    if (channel) {
        await (channel as TextChannel).send({ embed: received });
    }
}

export function autoMod(client: MyntClient, message: Message, guild: Guild): void {
    if (guild.config.staffBypass === true && client.isMod(message.member!, message.guild!)) {
        return;
    }

    if (guild.config.filter && guild.config.filter.enabled && filter(message, guild)) {
        return;
    }

    if (guild.config.inviteBlocker === true && inviteBlock(message)) {
        return;
    }
}

export function filter(message: Message, guild: Guild): boolean {
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
            message.delete({ timeout: 100, reason: "AutoMod - Word filter" })
                .catch((err) => {
                    console.log(err);
                });
            return true;
        }
    }

    return false;
}

export function inviteBlock(message: Message): boolean {
    const content = message.content;
    const regex = new RegExp("(https?://)?(www.)?(discord.(gg|io|me|li)|discord(app)?.com/invite)/.+[a-z]");

    if (content.match(regex)) {
        message.delete({ timeout: 100, reason: "AutoMod - Invite blocker" })
            .catch((err) => {
                console.log(err);
            });
        return true;
    }

    return false;
}
