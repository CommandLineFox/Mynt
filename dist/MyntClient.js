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
            EventHandler_1.EventHandler(this).catch((err) => {
                console.log(err);
            });
            new CommandHandler_1.default(this);
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
        if (this.isAdmin(member)) {
            return true;
        }
        const guildModel = await ((_a = this.database) === null || _a === void 0 ? void 0 : _a.guilds.findOne({ id: guild.id }));
        if (!guildModel) {
            return false;
        }
        const moderators = (_b = guildModel.config.roles) === null || _b === void 0 ? void 0 : _b.moderator;
        if (!moderators) {
            return false;
        }
        if (moderators.length === 0) {
            return false;
        }
        let mod = false;
        moderators.forEach(id => {
            if (member.roles.cache.some(role => role.id === id)) {
                mod = true;
            }
        });
        return mod;
    }
    isAdmin(member) {
        return member.permissions.has("ADMINISTRATOR");
    }
    isOwner(user) {
        return this.config.owners.includes(user.id);
    }
    async getPrefix(guild) {
        var _a;
        if (guild) {
            const guildDb = await ((_a = this.database) === null || _a === void 0 ? void 0 : _a.guilds.findOne({ id: guild.id }));
            if (!guildDb) {
                return this.config.prefix;
            }
            if (guildDb.config.prefix) {
                return guildDb.config.prefix;
            }
        }
        return this.config.prefix;
    }
    async generateMail(message) {
        var _a;
        const client = message.client;
        const author = message.author;
        const received = new discord_js_1.MessageEmbed()
            .setTitle(author.username)
            .setDescription(message)
            .setColor("#61e096")
            .setFooter("ID: " + author.id, author.displayAvatarURL());
        if (message.attachments && message.attachments.first()) {
            received.setImage((_a = message.attachments.first()) === null || _a === void 0 ? void 0 : _a.url);
        }
        const channel = client.channels.cache.find(channel => channel.id == this.config.mail);
        if (channel) {
            await channel.send({ embed: received });
        }
    }
}
exports.default = MyntClient;
//# sourceMappingURL=MyntClient.js.map