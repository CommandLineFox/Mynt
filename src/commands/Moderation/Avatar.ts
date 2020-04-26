import Command from "@command/Command";
import { Moderation } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { MessageEmbed } from "discord.js";
import ArgumentHandler from "@command/ArgumentHandler";

export default class Avatar extends Command {
    constructor () {
        super({name: "Avatar", triggers: ["avatar", "av", "pfp"], description: "Displays the specified user's avatar", group: Moderation});
    }

    async run(event: CommandEvent) {
        const args = await ArgumentHandler.getArguments(event, event.argument, "member");
        if (!args) {
            event.reply("invalid arguments.");
            return;
        }
        
        const [member] = args;
        const avatar = new MessageEmbed()
            .setTitle(`${member.user.tag}'s avatar:`)
            .setImage(member.user.displayAvatarURL)
            .setFooter(`Requested by ${event.author.username}`, event.author.displayAvatarURL());
        event.channel.send({ embed: avatar });
    }
}