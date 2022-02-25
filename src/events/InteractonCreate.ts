import type { Interaction } from "discord.js";
import type { BotClient } from "../BotClient";
import type Command from "../command/Command";
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

            if (!hasUserPermission) {
                interaction.reply({ content: "You're not allowed to execute this command", ephemeral: true });
                return;
            }
            if (!hasBotPermission) {
                interaction.reply({ content: "I'm not allowed to execute this command", ephemeral: true });
            }
            try {
                command.execute(interaction);
            } catch (error) {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
}

function hasUserPermission(command: Command, interaction: Interaction) {
    return interaction.memberPermissions && command.permissions && interaction.memberPermissions.has(command.permissions);
}

function hasBotPermission(command: Command, interaction: Interaction) {
    return interaction.guild?.me?.permissions && command.permissions && interaction.guild.me.permissions.has(command.permissions);
}
