import Command from "@command/Command";
import {Mail} from "~/Groups";
import CommandEvent from "@command/CommandEvent";

export default class ReplyTo extends Command {
    public constructor() {
        super({
            name: "ReplyTo",
            triggers: ["replyto"],
            description: "Sends a message to a specified user",
            group: Mail
        });
    }

    public async run(event: CommandEvent): Promise<void> {
        const guild = event.guild;
        const [user, text] = event.argument.split(/\s+/, 3)
        const member = guild.members.cache.find(member => user === member.id || user === `<@${member.id}>` || user === `<@!${member.id}>` || user === member.user.username || user === member.user.tag);

        if (!member) {
            await event.send("Couldn't find the user you're looking for");
            return;
        }

        member.user.send(text)
            .catch(() => {
                event.reply("the specified user has their DMs disabled or has me blocked.");
                return;
            })
            .then(() => {
                event.send(`Successfully sent the message to ${member.user.tag}.`);
            });
    }
}
