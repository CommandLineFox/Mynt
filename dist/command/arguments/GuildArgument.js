"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../../utils/Utils");
class GuildArgument {
    static handleId(event, message) {
        return Utils_1.splitMessage(message, (id) => event.client.guilds.cache.get(id));
    }
    static handleName(event, message) {
        return Utils_1.nameCheck(message, event.client.guilds.cache, (guild, name) => guild.name === name);
    }
    async toType(event, message) {
        const result = await GuildArgument.handleId(event, message);
        if (result[0] !== undefined) {
            return result;
        }
        return GuildArgument.handleName(event, message);
    }
}
exports.default = GuildArgument;
//# sourceMappingURL=GuildArgument.js.map