import { SlashCommandBuilder } from "@discordjs/builders";
import type { Interaction, PermissionResolvable } from "discord.js";

export default abstract class Command {
    public readonly data: SlashCommandBuilder;
    public readonly botPermissions: PermissionResolvable[] | undefined;
    public readonly userPermissions: PermissionResolvable[] | undefined;

    protected constructor(name: string, description: string, botPermissions?: PermissionResolvable[], userPermissions?: PermissionResolvable[]) {
        this.data = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description);
        this.botPermissions = botPermissions ?? undefined;
        this.userPermissions = userPermissions ?? undefined;
    }

    public abstract execute(interaction: Interaction): void;
}