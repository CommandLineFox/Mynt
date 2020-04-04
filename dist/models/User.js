"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bson_1 = require("bson");
class User {
    constructor(data) {
        var _a, _b, _c, _d;
        this._id = new bson_1.ObjectId();
        this.blacklisted = (_a = data.blacklisted) !== null && _a !== void 0 ? _a : false;
        this.id = data.id;
        this.infractions = (_b = data.infractions) !== null && _b !== void 0 ? _b : [];
        this.backups = (_c = data.backups) !== null && _c !== void 0 ? _c : [];
        this.stats = (_d = data.stats) !== null && _d !== void 0 ? _d : {
            totalSentMessages: 0,
            totalSentCharacters: 0,
            totalDeletedMessages: 0,
            totalCustomEmojisUsed: 0,
            totalTimesMentionedAUser: 0,
            totalSentAttachments: 0,
            totalTimesReacted: 0,
            mostUsedReaction: '',
        };
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map