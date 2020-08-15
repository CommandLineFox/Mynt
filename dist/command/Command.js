"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Command {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        this.name = options.name;
        this.triggers = options.triggers;
        this.description = options.description;
        this.botPermissions = options.botPermissions || [];
        this.userPermissions = options.userPermissions || [];
        this.group = options.group;
        this.modOnly = (_b = (_a = this.group.modOnly) !== null && _a !== void 0 ? _a : options.modOnly) !== null && _b !== void 0 ? _b : false;
        this.adminOnly = (_d = (_c = this.group.adminOnly) !== null && _c !== void 0 ? _c : options.adminOnly) !== null && _d !== void 0 ? _d : false;
        this.guildOnly = (_f = (_e = this.group.guildOnly) !== null && _e !== void 0 ? _e : options.guildOnly) !== null && _f !== void 0 ? _f : false;
        this.ownerOnly = (_h = (_g = this.group.ownerOnly) !== null && _g !== void 0 ? _g : options.ownerOnly) !== null && _h !== void 0 ? _h : false;
    }
    execute(event) {
        if (this.ownerOnly && !event.client.isOwner(event.author)) {
            event.reply('you do not own me!');
            return;
        }
        if ((this.modOnly && !event.client.isMod(event.member)) || (this.adminOnly && !event.client.isAdmin(event.member))) {
            event.reply('you do not have permission to run this command.');
            return;
        }
        if (this.guildOnly && !event.isFromGuild) {
            event.reply('this command can only be used in servers.');
            return;
        }
        if (event.isFromGuild) {
            const missingBotPermission = event.textChannel.permissionsFor(event.guild.me).missing(this.botPermissions);
            if (!missingBotPermission) {
                event.reply('I am not allowed to run this command.');
                return;
            }
            const missingUserPermission = event.textChannel.permissionsFor(event.member).missing(this.userPermissions);
            if (!missingUserPermission) {
                event.reply('you are not allowed to run this command.');
                return;
            }
        }
        this.run(event);
    }
}
exports.default = Command;
//# sourceMappingURL=Command.js.map