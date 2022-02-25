import type { Interaction } from "discord.js";
import type { BotClient } from "../BotClient";
import Event from "../event/Event";

export default class Ready extends Event {
    public constructor() {
        super("interactionCreate");
    }

    public async callback(client: BotClient, interaction: Interaction): Promise<void> {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return;
            }

            try {
                command.execute(interaction);
            } catch (error) {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
}
