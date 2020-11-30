"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Guild = void 0;
const bson_1 = require("bson");
class Guild {
    constructor(data) {
        var _a;
        this._id = new bson_1.ObjectId();
        this.id = data.id;
        this.config = (_a = data.config) !== null && _a !== void 0 ? _a : {};
    }
}
exports.Guild = Guild;
//# sourceMappingURL=Guild.js.map