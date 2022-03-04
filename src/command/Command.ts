import { SlashCommandBuilder } from "@discordjs/builders";
import type { CommandInteraction, PermissionResolvable } from "discord.js";

export default abstract class Command {
    public readonly data: SlashCommandBuilder;
    public readonly botPermissions: PermissionResolvable[];
    public readonly userPermissions: PermissionResolvable[];

    protected constructor(name: string, description: string, botPermissions?: PermissionResolvable[], userPermissions?: PermissionResolvable[]) {
        this.data = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description)
        this.botPermissions = botPermissions ?? [];
        this.userPermissions = userPermissions ?? [];
    }

    public abstract execute(interaction: CommandInteraction): void;
}
