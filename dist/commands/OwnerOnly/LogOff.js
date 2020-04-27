"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../../command/Command"));
const Groups_1 = require("../../Groups");
class LogOff extends Command_1.default {
    constructor() {
        super({ name: "LogOff", triggers: ["logoff", "shutdown"], description: "Turns the bot off", group: Groups_1.OwnerOnly });
    }
    async run(event) {
        event.client.destroy();
    }
}
exports.default = LogOff;
//# sourceMappingURL=LogOff.js.map