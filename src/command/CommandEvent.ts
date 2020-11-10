import { Message, StringResolvable, MessageOptions, TextChannel, DMChannel, User, Guild, GuildMember, NewsChannel, MessageEmbed } from "discord.js";
import MyntClient from "~/MyntClient";

export default class CommandEvent {
    readonly message: Message;
    readonly client: MyntClient;
    readonly author: User;
    readonly argument: string;
    readonly channel: TextChannel | DMChannel | NewsChannel;
    readonly isFromGuild: boolean;
    readonly textChannel: TextChannel | undefined;
    readonly guild: Guild;
    readonly member: GuildMember;

    constructor(message: Message, client: MyntClient, argument: string) {
        this.message = message;
        this.client = client;
        this.author = message.author;
        this.argument = argument;
        this.channel = message.channel;
        this.isFromGuild = this.channel.type === "text";
        this.textChannel = this.channel instanceof TextChannel ? this.channel : undefined;
        this.guild = message.guild!;
        this.member = message.member!;
    }

    send(content: StringResolvable, options?: MessageOptions | MessageEmbed): Promise<Message | Message[]> {
        return options ? this.channel.send(content, options) : this.channel.send(content);
    }

    reply(content: StringResolvable, options?: MessageOptions) {
        return options ? this.message.reply(content, options) : this.message.reply(content);
    }
}