import { nameCheck, splitMessage, tagCheck } from "../../utils/Utils";
export default class UserArgument {
    static handleId(event, message) {
        return splitMessage(message, (id) => event.client.users.cache.get(id));
    }
    static handleMention(event, message) {
        return splitMessage(message, (mention) => event.client.users.cache.find((user) => mention === `<@${user.id}>` || mention === `<@!${user.id}>`));
    }
    static handleTag(event, message) {
        return tagCheck(message, event.client.users.cache, (user, tag) => user.tag === tag);
    }
    static handleUsername(event, message) {
        return nameCheck(message, event.client.users.cache, (user, name) => user.username === name);
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
//# sourceMappingURL=UserArgument.js.map