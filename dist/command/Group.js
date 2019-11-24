"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommandRegistry_1 = __importDefault(require("./CommandRegistry"));
class Group {
    constructor(options) {
        this.name = options.name;
        this.description = options.description;
        this.ownerOnly = options.ownerOnly || false;
        this.guildOnly = options.guildOnly || false;
    }
    get commands() {
        return this._commands || (this._commands = CommandRegistry_1.default.getCommands(this));
    }
}
exports.default = Group;
//# sourceMappingURL=Group.js.map