import { SlashCommandBuilder } from "@discordjs/builders";
import type { Interaction, PermissionResolvable } from "discord.js";

export default abstract class Command {
    public readonly data: SlashCommandBuilder;
    public readonly permissions: PermissionResolvable[] | undefined;

    protected constructor(name: string, description: string, permissions?: PermissionResolvable[]) {
        this.data = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description);
        if (permissions) {
            this.permissions = permissions;
        }
    }

    public abstract execute(interaction: Interaction): void;
}