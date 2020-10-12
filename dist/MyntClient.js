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
                this.generateMail(message);
            }
        });
    }
    async isMod(member, guild) {
        var _a, _b;
        const guildmodel = await ((_a = this.database) === null || _a === void 0 ? void 0 : _a.guilds.findOne({ id: guild.id }));
        if (!guildmodel) {
            return false || this.isAdmin(member);
        }
        const moderators = (_b = guildmodel.config.roles) === null || _b === void 0 ? void 0 : _b.moderator;
        if (!moderators) {
            return false || this.isAdmin(member);
        }
        if (moderators.length === 0) {
            return false || this.isAdmin(member);
        }
        let mod = false;
        moderators.forEach(id => {
            if (member.roles.cache.some(role => role.id === id)) {
                mod = true;
            }
        });
        return mod || this.isAdmin(member);
    }
    isAdmin(member) {
        if (member.permissions.has("ADMINISTRATOR")) {
            return true;
        }
        return false;
    }
    isOwner(user) {
        return this.config.owners.includes(user.id);
    }
    async getPrefix(guild) {
        if (guild) {
            let guilddb = await this.database.guilds.findOne({ id: guild.id });
            if (!guilddb) {
                return this.config.prefix;
            }
            if (guilddb.config.prefix) {
                return guilddb.config.prefix;
            }
        }
        return this.config.prefix;
    }
    generateMail(message) {
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
        const channel = client.channels.cache.find(channel => channel.id == this.config.mail);
        if (channel) {
            channel.send({ embed: received });
        }
    }
}
//# sourceMappingURL=MyntClient.js.map