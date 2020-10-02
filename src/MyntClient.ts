import { Client, ClientOptions, User, Guild, GuildMember, MessageEmbed, Message, TextChannel } from "discord.js";
import configTemplate from "~/Config";
import { IFunctionType } from "~/ConfigHandler";
import CommandHandler from "@command/CommandHandler";
import { EventHandler } from "@event/EventHandler";
import { Database } from "@utils/Database";

type configTemplate = typeof configTemplate;

export default class MyntClient extends Client {
    readonly config: { [key in keyof configTemplate]: IFunctionType<configTemplate[key]> };
    readonly database?: Database;
    lastDmAuthor?: User;

    constructor(config: { [key in keyof configTemplate]: IFunctionType<configTemplate[key]> }, database?: Database, options?: ClientOptions) {
        super(options);
        this.config = config;
        this.database = database;
        this.once("ready", () => {
            EventHandler(this)
            new CommandHandler(this)
        });
        this.on("message", (message) => {
            if (!message.guild && !message.author.bot) {
                this.lastDmAuthor = message.author;
                this.generateMail(message);
            }
        });
    }

    async isMod(member: GuildMember, guild: Guild): Promise<Boolean> {
        const guildmodel = await this.database?.guilds.findOne({id: guild.id});
        if (!guildmodel) {
            return false || this.isAdmin(member);
        }
        
        const moderators = guildmodel.config.roles?.moderator;
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
        })

        return mod || this.isAdmin(member);
    }

    isAdmin(member: GuildMember): boolean {
        if (member.permissions.has("ADMINISTRATOR")) {
            return true;
        }
        return false;
    }

    isOwner(user: User): boolean {
        return this.config.owners.includes(user.id);
    }

    async getPrefix(guild?: Guild): Promise<string> {
        if (guild) {
            let guilddb = await this.database!.guilds.findOne({ id: guild.id });
            if (!guilddb) {
                return this.config.prefix;
            }

            if (guilddb.config.prefix) {
                return guilddb.config.prefix;
            }
        }
        return this.config.prefix;
    }

    private generateMail(message: Message) {
        const client = message.client;
        const author = message.author;
        const received = new MessageEmbed()
            .setTitle(author.username)
            .setDescription(message)
            .setColor("#61e096")
            .setFooter("ID: " + author.id, author.displayAvatarURL());
        if (message.attachments && message.attachments.first()) {
            received.setImage(message.attachments.first()!.url);
        }

        const channel = client.channels.cache.find(channel => channel.id == this.config.mail);

        if (channel) {
            (channel as TextChannel).send({ embed: received });
        }
    }
}
