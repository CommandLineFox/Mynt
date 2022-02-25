import { SlashCommandBuilder } from "@discordjs/builders";
import type { Interaction } from "discord.js";

export default abstract class Command {
    public data: SlashCommandBuilder;

    protected constructor(name: string, description: string) {
        this.data = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description);
    }

    public abstract execute(interaction: Interaction): void;
}