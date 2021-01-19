import Command from "@command/Command";
import { Moderation } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { MessageEmbed } from "discord.js";
import { getMember } from "@utils/Utils";

export default class Avatar extends Command {
    public constructor() {
        super({
            name: "Avatar",
            triggers: ["avatar", "av", "pfp"],
            description: "Displays the specified user's avatar",
            group: Moderation,
            botPermissions: ["EMBED_LINKS"]
        });
    }

    public async run(event: CommandEvent): Promise<void> {
        const client = event.client;
        try {
            const guild = event.guild;
            const argument = event.argument;

            let member = await getMember(argument, guild);
            if (!member) {
                member = event.member;
            }

            const avatar = new MessageEmbed()
                .setTitle(`${member.user.tag}'s avatar:`)
                .setImage(member.user.displayAvatarURL())
                .setFooter(`Requested by ${event.author.username}`, event.author.displayAvatarURL());
            event.channel.send({ embed: avatar });
        } catch (error) {
            client.emit("error", error);
        }
    }
}
