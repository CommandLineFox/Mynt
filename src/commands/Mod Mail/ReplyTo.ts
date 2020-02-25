import Command from "@command/Command";
import { ModMail } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import ArgumentHandler from "@command/ArgumentHandler";

export default class ReplyTo extends Command {
    constructor () {
        super({name: "ReplyTo", triggers: ["replyto"], description: "Sends a message to a specified user", group: ModMail});
    }

    async run(event: CommandEvent) {
        const args = await ArgumentHandler.getArguments(event, event.argument, "member", "string");
        if (!args) {
            event.reply("invalid arguments.");
            return;
        }

        const [member, text] = args;
        member.user.send(text)
            .catch(() => {
                event.reply("the specified user has their DMs disabled or has me blocked.");
                return;
            })
            .then(() => {
                event.send(`Successfully sent the message to ${member.user.tag}.`);
            })
    }
}