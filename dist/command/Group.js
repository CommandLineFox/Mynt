"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CommandRegistry_1 = __importDefault(require("./CommandRegistry"));
class Group {
    constructor(options) {
        var _a, _b, _c, _d, _e;
        this.name = options.name;
        this.description = options.description;
        this.guildOnly = (_a = options.guildOnly) !== null && _a !== void 0 ? _a : false;
        this.modOnly = (_b = options.modOnly) !== null && _b !== void 0 ? _b : false;
        this.adminOnly = (_c = options.adminOnly) !== null && _c !== void 0 ? _c : false;
        this.ownerOnly = (_d = options.ownerOnly) !== null && _d !== void 0 ? _d : false;
        this.disabled = (_e = options.disabled) !== null && _e !== void 0 ? _e : false;
    }
    get commands() {
        var _a;
        return (_a = this._commands) !== null && _a !== void 0 ? _a : (this._commands = CommandRegistry_1.default.getCommands(this));
    }
}
exports.default = Group;
//# sourceMappingURL=Group.js.map