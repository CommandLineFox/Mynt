"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const CommandHandler_1 = __importDefault(require("./command/CommandHandler"));
const EventHandler_1 = require("./event/EventHandler");
class MyntClient extends discord_js_1.Client {
    constructor(config, database, options) {
        super(options);
        this.config = config;
        this.database = database;
        this.once("ready", () => {
            EventHandler_1.EventHandler(this);
            new CommandHandler_1.default(this);
        });
        this.on("message", (message) => {
            if (!message.guild && !message.author.bot) {
                this.lastDmAuthor = message.author;
                this.generateReceivedMessage(message);
            }
        });
    }
    isMod(member) {
        let mod = false;
        this.config.staff.forEach(id => {
            mod = member.roles.cache.has(id);
        });
        return mod;
    }
    isAdmin(member) {
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
        const received = new discord_js_1.MessageEmbed()
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
exports.default = MyntClient;
//# sourceMappingURL=MyntClient.js.map