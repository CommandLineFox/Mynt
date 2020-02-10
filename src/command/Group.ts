import Command from "./Command";
import CommandRegistry from "./CommandRegistry";

interface GroupOptions {
    readonly name: string;
    readonly description: string;
    readonly ownerOnly?: boolean;
    readonly guildOnly?: boolean;
    readonly staffOnly?: boolean;
}

export default class Group implements GroupOptions {
    readonly name: string;
    readonly description: string;
    readonly ownerOnly: boolean;
    readonly guildOnly: boolean;
    readonly staffOnly: boolean;
    
    constructor (options: GroupOptions) {
        this.name = options.name;
        this.description = options.description;
        this.ownerOnly = options.ownerOnly || false;
        this.guildOnly = options.guildOnly || false;
        this.staffOnly = options.staffOnly || false;
    }

    private _commands: ReadonlyArray<Command> | undefined;

    get commands(): ReadonlyArray<Command> {
        return this._commands || (this._commands = CommandRegistry.getCommands(this));
    }
}