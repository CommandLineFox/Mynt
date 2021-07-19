import Command from "@command/Command";
import { Administration } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
/*import { Guild } from "@models/Guild";
import { MessageEmbed, Role } from "discord.js";
import { splitArguments } from "@utils/Argument";
import { Database } from "~/database/Database";
import { DatabaseCheckOption, DisplayData, LoggingType } from "~/utils/Types";*/

export default class Config extends Command {
    public constructor() {
        super({
            name: "Config",
            triggers: ["config", "cfg", "setup"],
            description: "Configures various settings for the guild",
            group: Administration,
            botPermissions: ["EMBED_LINKS", "MANAGE_ROLES"]
        });
    }

    protected async run(event: CommandEvent): Promise<void> {
        const client = event.client;
        try {
            /*const database = client.database;
            const guild = await database.getGuild(event.guild.id);
            if (!guild) {
                return;
            }

            const [subcommand, args] = splitArguments(event.argument, 2);
            if (!subcommand) {
                await displayAllSettings(event, guild);
                return;
            }

            switch (subcommand.toLowerCase()) {

            }*/
        } catch (error) {
            client.emit("error", error);
        }
    }
}
