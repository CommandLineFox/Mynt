import Command from "../../command/Command";
import type { CommandInteraction } from "discord.js";

export default class Ping extends Command {
    public constructor() {
        super("ping", "Shows the bot's response time");
    }
    async execute(interaction: CommandInteraction) {
        interaction.reply("Pinging...");
    }
}
