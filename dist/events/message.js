"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = __importDefault(require("../event/Event"));
exports.event = new Event_1.default("message", async (_client, message) => {
    try {
        if (message.author.id === '399624330268508162')
            message.reply('Hi');
    }
    catch (error) {
        console.log(error);
    }
});
//# sourceMappingURL=message.js.map