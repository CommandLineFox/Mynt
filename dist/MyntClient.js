import { Client, MessageEmbed } from "discord.js";
import CommandHandler from "./command/CommandHandler";
import { EventHandler } from "./event/EventHandler";
export default class MyntClient extends Client {
    constructor(config, database, options) {
        super(options);
        this.config = config;
        this.database = database;
        this.once("ready", () => {
            EventHandler(this);
            new CommandHandler(this);
        });
        this.on("message", (message) => {
            if (!message.guild && !message.author.bot) {
                this.lastDmAuthor = message.author;
                this.generateReceivedMessage(message);
            }
        });
    }
    isMod(member, _guild) {
        let mod = false;
        this.config.staff.forEach(id => {
            mod = member.roles.cache.has(id);
        });
        return mod;
    }
    isAdmin(member, _guild) {
        if (member) {
        }
        return false;
    }
    isOwner(user) {
        return this.config.owners.includes(user.id);
    }
    getPrefix(guild) {
        if (guild) {
        }
        return this.config.prefix;
    }
    getModLog(guild) {
        if (guild) {
        }
        return this.config.modlog;
    }
    generateReceivedMessage(message) {
        const client = message.client;
        const author = message.author;
        const received = new MessageEmbed()
            .setTitle(author.username)
            .setDescription(message)
            .setColor("#61e096")
            .setFooter("ID: " + author.id, author.displayAvatarURL());
        if (message.attachments && message.attachments.first()) {
            received.setImage(message.attachments.first().url);
        }
        const channel = client.channels.cache.find(channel => channel.id == this.getModLog());
        if (channel) {
            channel.send({ embed: received });
        }
    }
}
//# sourceMappingURL=MyntClient.js.map