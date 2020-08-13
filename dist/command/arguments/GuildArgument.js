import { nameCheck, splitMessage } from "../../utils/Utils";
export default class GuildArgument {
    static handleId(event, message) {
        return splitMessage(message, (id) => event.client.guilds.cache.get(id));
    }
    static handleName(event, message) {
        return nameCheck(message, event.client.guilds.cache, (guild, name) => guild.name === name);
    }
    async toType(event, message) {
        const result = await GuildArgument.handleId(event, message);
        if (result[0] !== undefined) {
            return result;
        }
        return GuildArgument.handleName(event, message);
    }
}
//# sourceMappingURL=GuildArgument.js.map