"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../command/Command");
const Groups_1 = require("../../Groups");
class Echo extends Command_1.default {
    constructor() {
        super({ name: "Echo", triggers: ["echo", "say"], group: Groups_1.Basic });
    }
    run(event) {
        event.message.delete(100);
        event.send(event.argument);
    }
}
exports.default = Echo;
//# sourceMappingURL=Echo.js.map