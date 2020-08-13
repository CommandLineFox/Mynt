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
                this.generateReceivedMessage(message);
            }
        });
    }

    isMod(member: GuildMember, _guild: Guild): boolean {
        let mod = false;
        this.config.staff.forEach(id => {
            mod = member.roles.cache.has(id as string);
        })
        return mod;
    }

    isAdmin(member: GuildMember, _guild: Guild): boolean {
        if (member) {

        }
        return false;
    }

    isOwner(user: User): boolean {
        return this.config.owners.includes(user.id);
    }

    getPrefix(guild?: Guild): string {
        if (guild) {
            
        }
        return this.config.prefix;
    }

    private getModLog(guild?: Guild): string {
        if (guild) {

        }
        return this.config.modlog;
    }

    private generateReceivedMessage(message: Message) {
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

        const channel = client.channels.cache.find(channel => channel.id == this.getModLog()) as TextChannel;

        if (channel) {
            channel.send({ embed: received });
        }
    }
}
