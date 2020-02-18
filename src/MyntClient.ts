import { Client, ClientOptions, User, Guild, GuildMember, RichEmbed, Message, TextChannel } from "discord.js";
import configTemplate from "./Config";
import { IFunctionType } from "./ConfigHandler";
import CommandHandler from "./command/CommandHandler";
import { formatter, IReplacer } from "./utils/Formatter";
import { EventHandler } from "./event/EventHandler";

type configTemplate = typeof configTemplate;

export default class MyntClient extends Client {
    readonly config: { [key in keyof configTemplate]: IFunctionType<configTemplate[key]> };
    lastDmAuthor?: User;
    format: (str: string, replace: IReplacer) => string;
    
    constructor(config: { [key in keyof configTemplate]: IFunctionType<configTemplate[key]> }, options?: ClientOptions) {
        super(options);
        this.config = config;
        this.format = formatter;
        this.once("ready", () => {
            EventHandler(this)
            new CommandHandler (this)
        });
        this.on("message", (message) => {
            if (!message.guild && !message.author.bot) {
                this.lastDmAuthor = message.author;
                this.generateReceivedMessage(message);
            }
        })
    }
    
    isStaff(member: GuildMember): boolean {
        return member.roles.some(r => this.config.staff.includes(r.id));
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
        const embed = new RichEmbed()
            .setTitle(author.username)
            .setDescription(message)
            .setColor("#61e096")
            .setFooter("ID: " + author.id, author.avatarURL)
        if (message.attachments && message.attachments.first()) {
            embed.setImage(message.attachments.first().url)
        }
        
        const channel = client.channels.find(channel => channel.id == this.getModLog()) as TextChannel;
        
        if(channel) {
            channel.send(embed)
        }
    }
}
