"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const CommandHandler_1 = __importDefault(require("./command/CommandHandler"));
const Formatter_1 = require("./utils/Formatter");
class MyntClient extends discord_js_1.Client {
    constructor(config, options) {
        super(options);
        this.config = config;
        this.format = Formatter_1.formatter;
        this.once("ready", () => {
            new CommandHandler_1.default(this);
        });
        this.on("message", (message) => {
            if (!message.guild && !message.author.bot) {
                this.lastDmAuthor = message.author;
                this.generateReceivedMessage(message);
            }
        });
    }
    isStaff(member) {
        return member.roles.some(r => this.config.staff.includes(r.id));
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
        const embed = new discord_js_1.RichEmbed()
            .setTitle(author.username)
            .setDescription(message)
            .setColor("#61e096")
            .setFooter("ID: " + author.id, author.avatarURL);
        if (message.attachments && message.attachments.first()) {
            embed.setImage(message.attachments.first().url);
        }
        const channel = client.channels.find(channel => channel.id == this.getModLog());
        if (channel) {
            channel.send(embed);
        }
    }
}
exports.default = MyntClient;
//# sourceMappingURL=MyntClient.js.map