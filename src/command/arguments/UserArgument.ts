import {User} from "discord.js";
import {nameCheck, splitMessage, tagCheck} from "@utils/Utils";
import CommandEvent from "@command/CommandEvent";
import Argument from "@command/IArgument";

export default class UserArgument implements Argument<User> {
    private static handleId(event: CommandEvent, message: string): Promise<[User?, string?]> {
        return splitMessage(message, (id) => event.client.fetchUser(id));
    }

    private static handleMention(event: CommandEvent, message: string): Promise<[User?, string?]> {
        return splitMessage(message, (mention) =>
            event.client.users.find((user) => mention === `<@${user.id}>` || mention === `<@!${user.id}>`));
    }

    private static handleTag(event: CommandEvent, message: string): [User?, string?] {
        return tagCheck(message, event.client.users, (user, tag) => user.tag === tag);
    }

    private static handleUsername(event: CommandEvent, message: string): [User?, string?] {
        return nameCheck(message, event.client.users, (user, name) => user.username === name);
    }

    public async toType(event: CommandEvent, message: string): Promise<[User?, string?]> {
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