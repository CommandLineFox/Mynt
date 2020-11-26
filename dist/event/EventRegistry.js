"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class EventRegistry {
    constructor() {
        this.events = this.loadEvents();
    }
    loadEvents() {
        const events = [];
        const folder = fs_1.readdirSync("./dist/events");
        for (const file of folder) {
            if (!file.endsWith(".js")) {
                continue;
            }
            let event;
            try {
                const path = `../events/${file}`;
                event = require(path).default;
            }
            catch (error) {
                console.log(error);
            }
            events.push(new event);
        }
        return events;
    }
}
exports.default = new EventRegistry();
//# sourceMappingURL=EventRegistry.js.map