import Command from "@command/Command";
import { ModMail } from "~/Groups";
import CommandEvent from "@command/CommandEvent";

export default class ReplyLast extends Command {

    constructor () {
        super({name: "ReplyLast", triggers: ["replylast"], description: "Replies to the last received DM", group: ModMail});
    }

    run(event: CommandEvent) {
        const argument = event.argument;
        const lastDm = event.client.lastDmAuthor;
        if (!lastDm) {
            event.send("Unable to find the last DM.");
            return
        }
        if (!argument) {
            event.reply("you can't send an empty message to users.")
        }
        lastDm!.send(argument)
            .catch(() => {
                event.reply("the specified user has their DMs disabled or has me blocked.");
                return;
            })
            .then(() => {
                event.send(`Successfully sent the message to ${lastDm!.tag}.`);
            })
    }
}