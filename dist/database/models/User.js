"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const bson_1 = require("bson");
class User {
    constructor(data) {
        var _a;
        this._id = new bson_1.ObjectId();
        this.id = data.id;
        this.infractions = (_a = data.infractions) !== null && _a !== void 0 ? _a : [];
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map