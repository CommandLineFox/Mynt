import { GuildMember as Member } from "discord.js";
import { nameCheck, splitMessage, tagCheck } from "@utils/Utils";
import CommandEvent from "@command/CommandEvent";
import Argument from "@command/IArgument";

export default class MemberArgument implements Argument<Member> {
    private static handleId(event: CommandEvent, message: string): Promise<[Member?, string?]> {
        return this.findMemberByString(
            event,
            message,
            (member, id) => id === member.id,
        );
    }

    private static handleMention(event: CommandEvent, message: string): Promise<[Member?, string?]> {
        return this.findMemberByString(
            event,
            message,
            (member, mention) => mention === `<@${member.id}>` || mention === `<@!${member.id}>`,
        );
    }

    private static findMemberByString(
        event: CommandEvent,
        message: string,
        check: (member: Member, part: string) => boolean,
    ): Promise<[Member?, string?]> {
        return splitMessage(message, (part) => {
            return event.guild.members.cache.find((member: Member) => check(member, part));
        });
    }

    private static handleTag(event: CommandEvent, message: string): [Member?, string?] {
        return tagCheck(message, event.guild.members.cache, (member: Member, tag: string) => member.user.tag === tag);
    }

    private static handleNickname(event: CommandEvent, message: string): [Member?, string?] {
        return nameCheck(message, event.guild.members.cache, (member: Member, nickname: string) => member.nickname === nickname);
    }

    private static handleUsername(event: CommandEvent, message: string): [Member?, string?] {
        return nameCheck(message, event.guild.members.cache, (member: Member, username: string) => member.user.username === username);
    }

    public async toType(event: CommandEvent, message: string): Promise<[Member?, string?]> {
        if (!event.isFromGuild) {
            return [undefined, message];
        }

        let result = await MemberArgument.handleId(event, message);
        if (result[0]) {
            return result;
        }
        result = await MemberArgument.handleMention(event, message);
        if (result[0]) {
            return result;
        }
        result = MemberArgument.handleTag(event, message);
        if (result[0]) {
            return result;
        }
        result = MemberArgument.handleNickname(event, message);
        if (result[0]) {
            return result;
        }
        return MemberArgument.handleUsername(event, message);
    }
}