import Command from "../../command/Command";
import { Basic } from "../../Groups";
import CommandEvent from "../../command/CommandEvent";
import { RichEmbed } from "discord.js";

export default class Help extends Command {
    constructor () {
        super({name: "Help", triggers: ["help", "commands", "cmds"], group: Basic});
    }

    run(event: CommandEvent) {
        const help = new RichEmbed()
            .setTitle("Here's the list of all my commands")
            .setColor("#61e096")
            .setFooter(`Requested by ${event.author.tag}`, event.author.avatarURL);
        event.send(help);
    }
}