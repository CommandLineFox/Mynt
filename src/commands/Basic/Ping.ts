import Command from "../../command/Command";
import type { CommandInteraction } from "discord.js";

export default class Ping extends Command {
    public constructor() {
        super("ping", "Pings the bot");
    }
    async execute(interaction: CommandInteraction) {
        interaction.reply("Pong!");
    }
}
