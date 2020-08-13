import CommandRegistry from "./CommandRegistry";
export default class Group {
    constructor(options) {
        this.name = options.name;
        this.description = options.description;
        this.guildOnly = options.guildOnly || false;
        this.modOnly = options.modOnly || false;
        this.adminOnly = options.adminOnly || false;
        this.ownerOnly = options.ownerOnly || false;
    }
    get commands() {
        return this._commands || (this._commands = CommandRegistry.getCommands(this));
    }
}
//# sourceMappingURL=Group.js.map