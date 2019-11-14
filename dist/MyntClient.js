"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const CommandHandler_1 = require("./command/CommandHandler");
class MyntClient extends discord_js_1.Client {
    constructor(config, options) {
        super(options);
        this.config = config;
        this.once("ready", () => {
            new CommandHandler_1.default(this);
        });
    }
    isOwner(user) {
        return this.config.owners.includes(user.id);
    }
    getPrefix(guild) {
        if (guild) {
        }
        return this.config.prefix;
    }
}
exports.default = MyntClient;
//# sourceMappingURL=MyntClient.js.map