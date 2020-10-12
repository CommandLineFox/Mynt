import Command from "../../command/Command";
import { Moderation } from "../../Groups";
import { MessageEmbed } from "discord.js";
export default class Avatar extends Command {
    constructor() {
        super({ name: "Avatar", triggers: ["avatar", "av", "pfp"], description: "Displays the specified user's avatar", group: Moderation });
    }
    async run(event) {
        const guild = event.guild;
        const argument = event.argument;
        let member = guild.members.cache.find(member => argument === member.id || argument === `<@${member.id}>` || argument === `<@!${member.id}>` || argument === member.user.username || argument === member.user.tag);
        if (!member) {
            member = event.member;
        }
        const avatar = new MessageEmbed()
            .setTitle(`${member.user.tag}'s avatar:`)
            .setImage(member.user.displayAvatarURL())
            .setFooter(`Requested by ${event.author.username}`, event.author.displayAvatarURL());
        event.channel.send({ embed: avatar });
    }
}
//# sourceMappingURL=Avatar.js.map