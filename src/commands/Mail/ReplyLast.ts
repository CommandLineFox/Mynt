import Command from "@command/Command";
import { Mail } from "~/Groups";
import CommandEvent from "@command/CommandEvent";

export default class ReplyLast extends Command {
    public constructor() {
        super({
            name: "ReplyLast",
            triggers: ["replylast"],
            description: "Replies to the last received DM",
            group: Mail
        });
    }

    public async run(event: CommandEvent): Promise<void> {
        const client = event.client;
        try {
            const argument = event.argument;
            const lastDm = event.client.lastDmAuthor;

            if (!lastDm) {
                await event.send("Unable to find the last DM.");
                return;
            }

            if (!argument) {
                await event.reply("you can't send an empty message to users.");
            }

            lastDm!.send(argument)
                .catch(() => {
                    event.reply("the specified user has their DMs disabled or has me blocked.");
                    return;
                })
                .then(() => {
                    event.send(`Successfully sent the message to ${lastDm!.tag}.`);
                });
        } catch (error) {
            client.emit("error", error);
        }
    }
}
