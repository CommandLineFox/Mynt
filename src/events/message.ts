import Event from "@event/Event";
import MyntClient from "~/MyntClient";
import { Message, MessageEmbed, TextChannel } from "discord.js";
import { Guild } from "@models/Guild";

export default class MessageEvent extends Event {
    public constructor() {
        super({ name: "message" });
    }

    public async callback(client: MyntClient, message: Message): Promise<void> {
        if (message.author.bot) {
            return;
        }
        
        if (!message.guild && !message.author.bot) {
            client.lastDmAuthor = message.author;
            await this.generateMail(client, message);
        }

        if (!message.guild) {
            return;
        }

        const guild = await client.getGuildFromDatabase(client.database!, message.guild.id);
        if (!guild) {
            return;
        }

        if (guild.config.automod) {
            this.autoMod(client, message, guild);
        }
    }

    private async generateMail(client: MyntClient, message: Message) {
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
            await (channel as TextChannel).send({embed: received});
        }
    }

    private autoMod(client: MyntClient, message: Message, guild: Guild) {
        if (guild.config.staffBypass === true && client.isMod(message.member!, message.guild!)) {
            return;
        }

        if (guild.config.filter && guild.config.filter.enabled && this.filter(message, guild)) {
            return;
        }

        if (guild.config.inviteBlocker === true && this.inviteBlock(message)) {
            return;
        }
    }

    private filter(message: Message, guild: Guild): boolean {
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

    private inviteBlock(message: Message): boolean {
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
}
