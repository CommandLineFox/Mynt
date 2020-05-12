import Command from "@command/Command";
import { Basic } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { MessageEmbed } from "discord.js";
import CommandRegistry from "@command/CommandRegistry";

export default class Help extends Command {
    constructor() {
        super({ name: "Help", triggers: ["help", "commands", "cmds"], description: "Displays all my commands", group: Basic });
    }

    run(event: CommandEvent) {
        const help = new MessageEmbed()
            .setTitle("Here's the list of all my commands")
            .setColor("#61e096")
            .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());
        CommandRegistry.groups.forEach((group) => {
            if (group.ownerOnly && !event.client.isOwner(event.author)) {
                return;
            }

            const commands = group.commands.map((command) => `${command.name} (\`${command.triggers.join('`,`')}\`) -> ${command.description}`);

            if (commands.length === 0) {
                return;
            }

            help.addField(group.name, commands.join('\n'));
        })

        event.send({ embed: help });
    }
}