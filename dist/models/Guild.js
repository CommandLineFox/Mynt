"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bson_1 = require("bson");
class Guild {
    constructor(data) {
        var _a, _b, _c;
        this._id = new bson_1.ObjectId();
        this.id = data.id;
        this.config = (_a = data.config) !== null && _a !== void 0 ? _a : {};
        this.config.blacklisted = (_c = (_b = data.config) === null || _b === void 0 ? void 0 : _b.blacklisted) !== null && _c !== void 0 ? _c : false;
    }
}
exports.Guild = Guild;
//# sourceMappingURL=Guild.js.map