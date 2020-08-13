import { nameCheck, splitMessage, tagCheck } from "../../utils/Utils";
export default class MemberArgument {
    static handleId(event, message) {
        return this.findMemberByString(event, message, (member, id) => id === member.id);
    }
    static handleMention(event, message) {
        return this.findMemberByString(event, message, (member, mention) => mention === `<@${member.id}>` || mention === `<@!${member.id}>`);
    }
    static findMemberByString(event, message, check) {
        return splitMessage(message, (part) => {
            return event.guild.members.cache.find((member) => check(member, part));
        });
    }
    static handleTag(event, message) {
        return tagCheck(message, event.guild.members.cache, (member, tag) => member.user.tag === tag);
    }
    static handleNickname(event, message) {
        return nameCheck(message, event.guild.members.cache, (member, nickname) => member.nickname === nickname);
    }
    static handleUsername(event, message) {
        return nameCheck(message, event.guild.members.cache, (member, username) => member.user.username === username);
    }
    async toType(event, message) {
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
//# sourceMappingURL=MemberArgument.js.map