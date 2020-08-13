import { ObjectId } from "bson";
export class Guild {
    constructor(data) {
        var _a, _b;
        this._id = new ObjectId();
        this.id = data.id;
        this.config = (_a = data.config) !== null && _a !== void 0 ? _a : {};
        this.infractions = (_b = data.infractions) !== null && _b !== void 0 ? _b : [];
    }
}
//# sourceMappingURL=Guild.js.map