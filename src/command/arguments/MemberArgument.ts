import {GuildMember as Member} from "discord.js";
import {nameCheck, splitMessage, tagCheck} from "../../Utils/Utils";
import CommandEvent from "../CommandEvent";
import Argument from "../IArgument";

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
            return event.guild.members.find((member) => check(member, part));
        });
    }

    private static handleTag(event: CommandEvent, message: string): [Member?, string?] {
        return tagCheck(message, event.guild.members, (member, tag) => member.user.tag === tag);
    }

    private static handleNickname(event: CommandEvent, message: string): [Member?, string?] {
        return nameCheck(message, event.guild.members, (member, nickname) => member.nickname === nickname);
    }

    private static handleUsername(event: CommandEvent, message: string): [Member?, string?] {
        return nameCheck(message, event.guild.members, (member, username) => member.user.username === username);
    }

    public async toType(event: CommandEvent, message: string): Promise<[Member?, string?]> {
        if (!event.isFromGuild) {
            return [undefined, message];
        }

        let result = await MemberArgument.handleId(event, message);
        if (result[0] !== undefined) {
            return result;
        }
        result = await MemberArgument.handleMention(event, message);
        if (result[0] !== undefined) {
            return result;
        }
        result = MemberArgument.handleTag(event, message);
        if (result[0] !== undefined) {
            return result;
        }
        result = MemberArgument.handleNickname(event, message);
        if (result[0] !== undefined) {
            return result;
        }
        return MemberArgument.handleUsername(event, message);
    }
}