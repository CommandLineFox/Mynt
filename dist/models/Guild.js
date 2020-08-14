import { ObjectId } from "bson";
export class Guild {
    constructor(data) {
        var _a;
        this._id = new ObjectId();
        this.id = data.id;
        this.config = (_a = data.config) !== null && _a !== void 0 ? _a : {};
    }
}
//# sourceMappingURL=Guild.js.map