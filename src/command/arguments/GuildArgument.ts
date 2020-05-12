import { Guild } from "discord.js";
import { nameCheck, splitMessage } from "@utils/Utils";
import CommandEvent from "@command/CommandEvent";
import Argument from "@command/IArgument";

export default class GuildArgument implements Argument<Guild> {
    private static handleId(event: CommandEvent, message: string): Promise<[Guild?, string?]> {
        return splitMessage(message, (id) => event.client.guilds.cache.get(id));
    }

    private static handleName(event: CommandEvent, message: string): [Guild?, string?] {
        return nameCheck(message, event.client.guilds.cache, (guild: Guild, name: string) => guild.name === name);
    }

    public async toType(event: CommandEvent, message: string): Promise<[Guild?, string?]> {
        const result = await GuildArgument.handleId(event, message);
        if (result[0] !== undefined) {
            return result;
        }
        return GuildArgument.handleName(event, message);
    }
}