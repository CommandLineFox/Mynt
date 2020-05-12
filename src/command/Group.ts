import Command from "@command/Command";
import CommandRegistry from "@command/CommandRegistry";

interface GroupOptions {
    readonly name: string;
    readonly description: string;
    readonly guildOnly?: boolean;
    readonly modOnly?: boolean;
    readonly adminOnly?: boolean;
    readonly ownerOnly?: boolean;
}

export default class Group implements GroupOptions {
    readonly name: string;
    readonly description: string;
    readonly guildOnly: boolean;
    readonly modOnly: boolean;
    readonly adminOnly: boolean;
    readonly ownerOnly: boolean;

    constructor(options: GroupOptions) {
        this.name = options.name;
        this.description = options.description;
        this.guildOnly = options.guildOnly || false;
        this.modOnly = options.modOnly || false;
        this.adminOnly = options.adminOnly || false;
        this.ownerOnly = options.ownerOnly || false;
    }

    private _commands: ReadonlyArray<Command> | undefined;

    get commands(): ReadonlyArray<Command> {
        return this._commands || (this._commands = CommandRegistry.getCommands(this));
    }
}