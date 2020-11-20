"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Command {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        this.name = options.name;
        this.triggers = options.triggers;
        this.description = options.description;
        this.botPermissions = (_a = options.botPermissions) !== null && _a !== void 0 ? _a : [];
        this.userPermissions = (_b = options.userPermissions) !== null && _b !== void 0 ? _b : [];
        this.group = options.group;
        this.modOnly = (_d = (_c = this.group.modOnly) !== null && _c !== void 0 ? _c : options.modOnly) !== null && _d !== void 0 ? _d : false;
        this.adminOnly = (_f = (_e = this.group.adminOnly) !== null && _e !== void 0 ? _e : options.adminOnly) !== null && _f !== void 0 ? _f : false;
        this.guildOnly = (_h = (_g = this.group.guildOnly) !== null && _g !== void 0 ? _g : options.guildOnly) !== null && _h !== void 0 ? _h : false;
        this.ownerOnly = (_k = (_j = this.group.ownerOnly) !== null && _j !== void 0 ? _j : options.ownerOnly) !== null && _k !== void 0 ? _k : false;
    }
    async execute(event) {
        var _a, _b, _c, _d;
        if (this.ownerOnly && !event.client.isOwner(event.author)) {
            await event.reply("you do not own me!");
            return;
        }
        if ((this.modOnly && !(await event.client.isMod(event.member, event.guild))) || (this.adminOnly && !event.client.isAdmin(event.member))) {
            await event.reply("you do not have permission to run this command.");
            return;
        }
        if (this.guildOnly && !event.isFromGuild) {
            await event.reply("this command can only be used in servers.");
            return;
        }
        if (event.isFromGuild) {
            const missingBotPermission = (_b = (_a = event.textChannel) === null || _a === void 0 ? void 0 : _a.permissionsFor(event.guild.me)) === null || _b === void 0 ? void 0 : _b.missing(this.botPermissions);
            if (!missingBotPermission) {
                await event.reply("I am not allowed to run this command.");
                return;
            }
            const missingUserPermission = (_d = (_c = event.textChannel) === null || _c === void 0 ? void 0 : _c.permissionsFor(event.member)) === null || _d === void 0 ? void 0 : _d.missing(this.userPermissions);
            if (!missingUserPermission) {
                await event.reply("you are not allowed to run this command.");
                return;
            }
        }
        try {
            this.run(event);
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.default = Command;
//# sourceMappingURL=Command.js.map