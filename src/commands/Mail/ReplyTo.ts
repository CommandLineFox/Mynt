import Command from "@command/Command";
import {Mail} from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { splitArguments } from "@utils/Utils";

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
        const client = event.client;
        const guild = event.guild;
        const [user, text] = splitArguments(event.argument, 2);
        const member = await client.getMember(user, guild);

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
