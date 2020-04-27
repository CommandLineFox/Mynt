"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../../utils/Utils");
class UserArgument {
    static handleId(event, message) {
        return Utils_1.splitMessage(message, (id) => event.client.users.cache.get(id));
    }
    static handleMention(event, message) {
        return Utils_1.splitMessage(message, (mention) => event.client.users.cache.find((user) => mention === `<@${user.id}>` || mention === `<@!${user.id}>`));
    }
    static handleTag(event, message) {
        return Utils_1.tagCheck(message, event.client.users.cache, (user, tag) => user.tag === tag);
    }
    static handleUsername(event, message) {
        return Utils_1.nameCheck(message, event.client.users.cache, (user, name) => user.username === name);
    }
    async toType(event, message) {
        if (!event.isFromGuild) {
            return [undefined, message];
        }
        let result = await UserArgument.handleId(event, message);
        if (result[0]) {
            return result;
        }
        result = await UserArgument.handleMention(event, message);
        if (result[0]) {
            return result;
        }
        result = UserArgument.handleTag(event, message);
        if (result[0]) {
            return result;
        }
        return UserArgument.handleUsername(event, message);
    }
}
exports.default = UserArgument;
//# sourceMappingURL=UserArgument.js.map