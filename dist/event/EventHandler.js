"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EventRegistry_1 = __importDefault(require("./EventRegistry"));
class EventHandler {
    constructor(client) {
        this.client = client;
        for (const event of EventRegistry_1.default.events) {
            client.on(event.name, (...args) => {
                event.callback(client, ...args);
            });
        }
    }
}
exports.default = EventHandler;
//# sourceMappingURL=EventHandler.js.map